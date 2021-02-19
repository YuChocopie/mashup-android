---
title: "Replace LiveData, SingleLiveEvent with Coroutines!"
date: "2020-12-26"
tags: ["mash-up", "jsh-me", "coroutines", "stateflow", "channel"]
description: "Coroutine으로 LiveData와 SingleLiveEvent 대체하기"
cover: "./ic_android.png"
---



## Flow 와 Channel 의 작고 귀여운 기능

안녕하세요. Mash-up Android 10기 정세희라고 합니다. 요즘 쭉쭉 상승세인 Coroutine 의 귀여운 아이들인 Flow 와 Channel 의 간단한 기능 하나를 소개하기 위해 나타나게 되었습니다 : )

안드로이드에서도 이제 별도의 라이브러리 추가 없이 Coroutine을 기본적으로 사용할 수 있습니다. 비동기 라이브러리의 대표적인 Rxjava를 뒤쫓고 있는 무서운 녀석이죠. 앞서 매쉬업 안드로이드 블로그에서 기본적인 Coroutine 동작방법에 대해서 설명했다면, 이번 글에서는 비동기적으로 사용하는 방법 외에 MVVM 아키텍처에서 자주 쓰이는 LiveData 와 SingleLiveEvent 를 Corouitne의 Flow, Channel 로 대체해서 사용하는 방법에 대해 알아보려고 합니다.

<p align="center">
  <img src="https://user-images.githubusercontent.com/39688690/103150077-9fc2e480-47b3-11eb-9378-2c0eedafae3e.png" width="80%">
  <br>
  <strike>Channel 과 Flow 의 간단한 지식만 알고 있다면 금방 따라할 수 있을 것이라 믿어 의심치 않습니다.</strike>
</p>

<br>

* **LiveData를 StateFlow로 대체하기**

LiveData 는 AAC의 일부로 Observer pattern 을 쉽게 구현할 수 있는 녀석입니다. 안드로이드에서 중요한 생명주기를 제대로 핸들링하지 못하게 된다면 메모리 누수나 최악의 경우 크래시를 일으킬 수 있게 되는데, LiveData 는 이런 복잡성을 줄여줄 수 있는 생명주기 관찰자로써의 역할을 하게 됩니다. 그래서 주로 AAC ViewModel 에서 View 가 Observe 하는 형태로 쓰이는 구조이기도 하죠 : )

이런 LiveData 와 비슷한 역할을 할 수 있는 것이 Coroutine 의 [StateFlow](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/) 라는 녀석입니다.  

> A [SharedFlow](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/index.html) that represents a read-only state with a single updatable data [value](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/value.html) that emits updates to the value to its collectors. A state flow is a *hot* flow because its active instance exists independently of the presence of collectors. Its current value can be retrieved via the [value](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/value.html) property.

아래 ViewModel 에서 LiveData 를 사용하는 코드가 있습니다. 버튼을 누를 때 텍스트뷰의 숫자가 1씩 증가하는 경우입니다. 

```kotlin
class MainViewModel : ViewModel() {
    private val _count = MutableLiveData<Int>()
    val count : LiveData<Int> = _count
    
    fun onButtonClick() {
        _count.value ++
    }
}
```

이 경우를 StateFlow 로 변경할 수 있습니다.

```kotlin
class MainViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count : StateFlow<Int> = _count

    fun onButtonClick() {
        _count.value ++
    }
}
```

그리고 Activity 에서는 아래와 같이 감지할 수 있습니다.

```kotlin
private fun observeData() {
    viewLifecycleOwner.lifecycleScope.launchWhenStarted {
        viewModel.count.collect {
            binding.counter.text = it.toString()
        }
    }
}
```

<br>

StateFlow 를 기준으로 LiveData 와 비교를 해볼 수 있습니다.

1. `StateFlow`는 항상 값을 가진다.

   StateFlow는 항상 값을 가지고 있는 형태여야합니다. 즉, value 를 통해 어느 시점에서든지 안전하게 읽을 수 있다는 의미입니다. 그 말은 즉슨 StateFlow 를 인스턴스화 할 때, 반드시 초기값을 제공해주어야 안전한 상태를 보장하며 시작할 수 있다는 의미입니다.

2. `LifecycleScope`

   viewLifecyleOwner.lifecycleScope Extension 을 사용하기 때문에 Flow는 LiveData 처럼 생명주기를 알 수 있습니다. 또한 destroy가 불리는 시점에 coroutine context 도 취소됩니다.

3. `launchWhenStarted`

   LiveData는 LifecycleOwner 가 활성화된 상태일 때만 데이터를 방출시킬 수 있고, onStarted 상태 이전일 경우에는 데이터 방출을 잠시 멈춥니다. 이 행동을 따라하기 위해 StateFlow 에서는 launchWhenStarted 를 사용하게 됩니다.

<br>

<br>

* **SingleLiveEvent를 Channel로 대체하기**

SingleLiveEvent는 LiveData를 이용하다보면 View의 재활성화가 되면서 LiveData가 observe를 호출하여, 불필요한 Observer Event까지 일어나는 경우가 있습니다. 이 불필요함을 방지하기 위해 LiveData 를 상속하여 생겨난 녀석입니다: ) (비슷한 녀석으로 Event 를 Wrapping 한 경우도 있죠 !)   

postValue나 setValue, call등을 통하여 setValue 함수를 거쳐야만이 Observer을 통하여 데이터를 전달 할 수 있기 때문에 Configuration Changed 등의 LifeCycleOwner의 재활성화 상태가 와도 원치 않는 이벤트가 일어나는 것을 방지할 수 있도록 해줍니다.

이 SingleLiveEvent 또한 Coroutine의 Channel 과 Flow 의 합체로 대체가 가능합니다! 버퍼 사이즈만큼의 BroadcastChannel 제공하면 Activity 에서 `Receive`가 발생할 때까지 suspend 상태가 지속됩니다. 

```kotlin
class MyViewModel : ViewModel() {
    protected val actionSender = BroadcastChannel<Action>(Channel.BUFFERED)
    val actionReceiver = actionSender.asFlow()
}
```

> Broadcast channel is a non-blocking primitive for communication between the sender and multiple receivers that subscribe for the elements using [openSubscription](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-broadcast-channel/open-subscription.html) function and unsubscribe using [ReceiveChannel.cancel](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-receive-channel/cancel.html) function.

```kotlin
private fun observeActionCommand() {
    lifecycleScope.launchWhenStarted {
        viewModel.actionReceiver.collect {
            // TODO
        }
    }
}
```



그럼 여기서 ❔ 이런 질문이 나올 수 있습니다.

🤷‍♂ : BroadcastChannel 을 사용하지 않고, Channel 을 사용할 수 있지 않나요 ?

<p align="center">
  <img src="https://user-images.githubusercontent.com/39688690/103150173-d0574e00-47b4-11eb-9459-0dbd2954e83e.jpg" width="40%">
    <br>
 나: 그러게.....
 </p>

BroadcastChannel 은 Channel 이 아닌 Hot Flow다! 라는 말도 있죠. 그렇다면 Channel 과 BroadcastChannel  은 무슨 차이점이 있는 것일까요 ? 

```kotlin
1. val action = Channel<Action>(Channel.BUFFERED)
2. val action = BroadcastChannel<Action>(Channel.BUFFERED)
```

🧚‍♂ : Channel을 사용하게 되면 **configuration change** 가 발생하게 된 후에는 더이상 액션을 감지할 수 없게 됩니다.

<br>

Channel 은 Send 과 Receive 을 구현해야 합니다. 또한 Channel 은 더이상 사용하지 않는 경우 receive 대신 close 시킬 수 있습니다. 또한 덫붙여서 이야기 하자면 close 는 특별한 token 이기 때문에 이 token을 만나면 주입되고 있는 데이터를 막게 됩니다. 이 형태는 곧 **close를 호출하더라도 그 이전에 넣어놓은 값들은 받아올 수 있음을 보장할 수 있다는** 것을 의미하게 됩니다 : )

BroadcastChannel 은 SendChannel 만 구현합니다. Flow 를 시작할 때마다 ReceiveChannel 이 생성하게 되는데, 이 방식은 BroadcastChannel은 열려있는 상태일지라도 Scope 가 닫힌 상태라면 ReceiveChannel 도 닫히게 됩니다. 이 방식은 곧 Lifecycle을 맞출 수 있다는 의미로 갈 수 있다고 생각하면 되겠죠?

