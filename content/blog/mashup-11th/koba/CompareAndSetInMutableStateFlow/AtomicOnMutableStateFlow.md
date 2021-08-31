---
title: "StateFlow 값의 원시성을 보장하는 방법"
date: "2021-08-31"
tags: ["mash-up", "Coroutine", "MutableStateFlow", "StateFlow", "compareAndSet"]
description: "다수의 코루틴에서 안전하게 StateFlow에 접근하는 방법에 대해 알아보았습니다."
cover: "./thumbnail.png"
---

안녕하세요. 메쉬업 안드로이드 11기 이두한입니다. 

이번엔 Android Weekly에도 소개된 [Atomic on updates with MutableStateFlow](https://medium.com/geekculture/atomic-updates-with-mutablestateflow-dc0331724405)포스팅에 나와있는
`StateFlow`가 갖고 있는 값에 다수의 코루틴이 동시 접근하였을 경우 발생하는 문제와 해결방법에 대해 알아보도록 하겠습니다.

`StateFlow`는 MVVM 패턴에서 UI 상태를 유지하고 내보내는데 일반적으로 사용됩니다.
예를 들어 뷰 모델 안에서 ViewState라는 데이터 클래스가 뷰의 상태를 나타내고 이이 관리하기 위해
StateFlow를 사용한다면 아래와 같이 나타낼 수 있을겁니다.


## Update ui state using StateFlow

```kotlin
class MainViewModel: ViewModel(){
    private val _viewState = MutableStateFlow<ViewState>(ViewState())
    val viewState = _viewSate.asStateFlow()

    ...
    
    data class ViewState(
        val showProgress: Boolean = false,
        val title: String = "Default title",
        val likeButtonEnabled: Boolean = true
    )
}
```

Activity나 Fragment에서 해당 flow를 소비하고 내보낸 값을 이용하여 UI상태를 변경할 수 있을겁니다.

```kotlin
class MainFragment: Fragment(){

    ovveride fun onViewCreated(view: View, savedInstanceState: Bundle?){
        viewModel.run{
            viewState.onEach{
                if(it.showProgress){
                    // update the UI to show progress bar
                }
            }.launchIn(viewLifecycleOwner.lifecycleScope)
        }
    }

    ...
}
```

위와 같은 방식으로 flow를 반복적으로 관찰함으로써 항상 최신 UI 상태를 얻을 수 있고,
아래 같이 `copy` function을 사용하여 다른 값들은 유지하면서 하나 이상의 속성을 수정 할 수 있습니다.
data class와 StateFlow를 사용하여 UI 상태를 아주 간단하게 업데이트 할 수 있는 것이죠.

```kotlin
class MainViewModel: ViewModel(){
    _viewState.value = _viewState.value.copy(likeButtonEnabled = true)
    
    ...
}
```


## Problem🔥
이와 같은 구조에 한가지 문제가 발생할 수 있는데, `copy` 함수가 완료되고 `StateFlow`에 새 값이 내보내지는 시간 사이에 다른 스레드가 
값을 업데이트하고 `copy` 수정하지 않는 속성 중 하나를 변경했을 경우입니다.

```kotlin
class MainViewModel : ViewModel() {

    // launch change enable button
    viewModelScope.launch(Dispatcher.IO){
        _viewState.value = _viewState.value.copy(likeButttonEnabled = true)
    }

    // launch change title
    viewModelScope.launch(Dispatcher.Default){
        _viewState.value = _viewState.value.copy(title = "Hello, new title")
    }

    ...
}
```

두 `launch` 람다가 완료된 후 상태 흐름을 관찰하기 시작했다면, 현재 `ViewState`는 어떤 값을 나타내고 있을까요?

`title`의 `Hello, new title`과 `likeButtonEnabled`의 값 `true`로 원하는 결과값이 항상 도출될까요?
많은 코드 실행에 대해서 개발자가 의도한 결과값을 얻을 수 있겠지만 두 람다의 동시적 특성을 감안할때 항상 같은 값을 얻을 순 없습니다.
즉, 원자성을 보장하지 않는 것이죠.

만약 launch 코드가 동시에 실행된다면 `title` 업데이트 람다, `likeButtonEnabled` 업데이트 람다 둘 중 하나만 적용될 것입니다.


## Solution🚀 - Mutax
첫 번째 가능한 솔루션은 StateFlow에 대한 모든 업데이트 이벤트를 감싸서 동시에 StateFlow value에 접근하는 것을 막는 것입니다.

```kotlin
    // launch change enable button
    viewModelScope.launch(Dispatcher.IO){
        mutex.withLock{
            _viewState.value = _viewState.value.copy(likeButttonEnabled = true)
        }
    }

    // launch change title
    viewModelScope.launch(Dispatcher.Default){
        mutex.withLock{
            _viewState.value = _viewState.value.copy(title = "Hello, new title")
        }
    }
}
```

나쁜 솔루션은 아니지만 개발자가 `mutex` 동기화 방법과 규칙을 관리 해야 합니다.

## Solution🚀 - update with compareAndSet
[Kotlin Coroutines 버전 1.5.1](https://github.com/Kotlin/kotlinx.coroutines/releases)에서 사용할 수 있는 `MutableStateFlow`의 새로운 확장 함수인 `update`를 사용하는 방법입니다.

```kotlin
    // launch change enable button
    viewModelScope.launch(Dispatcher.IO){
        _viewState.update { it.copy(likeButttonEnabled = true) }
    }

    // launch change title
    viewModelScope.launch(Dispatcher.Default){
        _viewSate.update { it.copy(title = "Hello, new title") }
    }
}
```

코드도 훨씬 깔끔해지고 동시 접근에도 안전합니다. `update`함수의 소스 코드를 살펴 보면 다음과 같습니다.

```kotlin
public inline fun <T> MutableStateFlow<T>.update(function: (T) -> T) {
    while (true) {
        val prevValue = value
        val nextValue = function(prevValue)
        if (compareAndSet(prevValue, nextValue)) {
            return
        }
    }
}
```

고차함수가 매개변수로 전달되고 이전 상태 흐름 값에 적용되어 `nextValue`를 생성하는 것을 볼 수 있습니다.
그런 다음 `compareAndSet`함수로 새 값을 설정하기 전에 다른 스레드에 의해 이전 값이 변경되었는지 확인합니다.
조건문이 false이면 `update`함수는 값을 실제로 설정할 수 있을 때까지 반복문을 돌게 됩니다. 
현재 스레드가 실행되는 동안 다른 스레드가 이전 값을 변경하면 새 StateFlow값을 생성하는 데 사용된 고차 함수가
반복되게 되고 동시 접근하여도 원자성을 보장하게 됩니다.

`compareAndSet`에 대해 좀더 살펴보면 아래와 같이 주서과 함께 선언되어 있는데
현재 값을 기대값과 원자적으로 비교하고 기대값과 같으면 업데이트를 하도록 true를 반환하복
아닐 경우 false를 반환합니다. 이 메서드는 스레드로부터 안전하며 외부 동기화 없이 동시 코루틴에서 안전하게 호출할 수 있다고 주석을 통해
설명되어 있습니다.
```kotlin

    /**
     * Atomically compares the current [value] with [expect] and sets it to [update] if it is equal to [expect].
     * The result is `true` if the [value] was set to [update] and `false` otherwise.
     *
     * This function use a regular comparison using [Any.equals]. If both [expect] and [update] are equal to the
     * current [value], this function returns `true`, but it does not actually change the reference that is
     * stored in the [value].
     *
     * This method is **thread-safe** and can be safely invoked from concurrent coroutines without
     * external synchronization.
     */
    public fun compareAndSet(expect: T, update: T): Boolean
```

kotlin coroutine 1.5.1에서 추가된 `compareAndSet`을 사용하는 extension function에는 `update`외에도 `getAndUpdate`, `updateAndGet`
이 있는데 각각 이름에서 알 수 있듯이 update 전의 값을 반환하거나 update 후의 값을 반환합니다. 

## 결론
StateFlow를 활요하여 뷰 상태를 업데이트 하거나 데이터를 가공하여 사용하는 일이 많았는데 동시에 접근하는 것을 보장받지 못하는점과
`update`라는 확장함수를 통해 간단하게 원시성을 보장 받을 수 있다는 점을 알게 되었습니다.

### References
[https://medium.com/geekculture/atomic-updates-with-mutablestateflow-dc0331724405](https://medium.com/geekculture/atomic-updates-with-mutablestateflow-dc0331724405)