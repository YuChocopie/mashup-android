---
title: "Jetpack Compose Side Effect"
date: "2022-09-04"
tags: ["mash-up", "compose", "sideeffect", "dayeon"] 
description: "Compose의 SideEffect에 대해 알아보아요!"
cover: "./images/blog_thumb_dayeon.png"
---

안녕하세요🙌🏻

 Mash-up Android 12기 백다연입니다.  

Jetpack Compose를 프로젝트에 도입해보면서 조금 더 깊게 공부해보고 싶다는 생각을 갖게 되어 **Compose Side Effect** 라는 주제로 글을 작성해보려고 합니다! 
Side Effect가 무엇인지, 어떻게 처리하는 지 등 간단하게 소개해보도록 하겠습니다.

### Side Effect란?

<aside>
💡 Composable 범위 밖에서 발생하는 앱 상태에 대한 변경
</aside>

<br></br>
Composable을 사용할 때 여러 Composable을 겹쳐서 사용합니다. 이 경우 시스템은 각 Composable에 대한 LifeCycle을 만들게 됩니다. 또한, 기본적으로 Composable은 바깥쪽에서 안쪽으로 State를 내려줍니다.


 하지만,

1) 안쪽 Composable에서 바깥쪽에 있는 Composable의 상태에 대한 변경을 해준다면,

2) Composable에서 Composable이 아닌 앱 상태에 대해 변화를 준다면

⇒ 단방향이 아닌 양방향 의존성으로 Effect가 생기며 이를 **`Side Effect`**라고 부릅니다.

<br></br>
### Side Effect를 어떻게 처리할까?

Composable은 Side Effect가 없는 것이 좋으나, 앱 상태를 변경해야 하는 경우 Side Effect를 예측 가능한 방식으로 실행되도록 **Effect API**를 사용해야 합니다.

- Composable은 Side Effect에 Free 해야한다.
- 앱의 상태 변경이 필요할 때 Composable의 생명주기를 알고 있는 제어되는 환경으로 부터 호출해야 한다.
- Compose에서 가능성 있는 Effect들을 열어두기 때문에 쉽고 과하게 사용할 수있다. 그래서 UI와 관련되고 단방향 데이터 플로우를 중단시켜서는 안된다.

<br></br>
### Effect API

1. **LaunchedEffect**
- Composable Lifecycle Scope에서 suspend fun을 실행하기 위해 사용
- LaunchedEffect가 Composable 을 시작하면 매개변수로 전달된 코드 블록으로 코루틴이 실행됨
- LaunchedEffect가 Composition을 종료하면 코루틴이 취소됨
- LaunchedEffect가 다른 키로 recomposition 되면 기존 코루틴이 취소되고 새 코루틴에서 새 suspend 함수가 실행

```kotlin
@Composable
fun LaunchedEffect(
	key1 : Any?,
	block : suspend CorountineScope.() -> Unit
) {}
```

LaunchedEffect는 key라 불리는 기준가을 두어 key가 바뀔 때만 LaunchedEffect의 supsend fun을 취소하고 재실행합니다.

⇒recomposition은 Composable의 State가 바뀔 때마다 일어나므로, 만약 recomposition이 일어날 때마다 이전 LaunchedEffect가 취소되고 다시 수행된다면 매우 비효율적이기 때문에 이를 해결하기 위해!

```kotlin
@Composable
fun MyScreen(
    state: UiState<List<Movie>>,
    scaffoldState: ScaffoldState = rememberScaffoldState()
) {
    if (state.hasError) {
					LaunchedEffect(scaffoldState.snackbarHostState) {
							scaffoldState.snackbarHostState.showSnackbar(
              message = "Error message",
              actionLabel = "Retry message"
            )
        }
    }

    Scaffold(scaffoldState = scaffoldState) {
        /* ... */
    }
}
```

해당 코드는 상태가 오류일 때 스낵바를 보여주는 코드입니다. 코루틴이 취소되면 스낵바는 dismiss됩니다. 즉, 상태에 오류가 포함되어 있으면 코루틴이 실행되고 오류가 포함되어 있지 않으면 취소됩니다. 


그렇다면 LaunchedEffect의 block을 두개 이상의 변수에 의해 재실행 해야 할 때는 어떻게 해야할까요? 

```kotlin
@Composable
fun LaunchedEffect(
	key1 : Any?,
	key2 : Any?,
	block : suspend CorountineScope.() -> Unit
) {}

@Composable
fun LaunchedEffect(
	vararg : Any?,
	block : suspend CorountineScope.() -> Unit
) {}
```

바로 key값을 개수만큼 추가해주면 됩니다! vararg를 사용하여 Key값을 무제한으로 줄 수 있다는 것도 기억합시다.

1. **DisposableEffect**
- Composable이 Dispose될 때 정리되어야 할 Side Effect를 정의하기 위해 사용합니다. 즉 Composable의 Lifecycle에 맞춰 정리되어야 하는 리스너나 작업이 있는 경우에 해당 리스너나 작업을 제거하기 위해 사용되는 Effect 입니다.

```kotlin
@Composable
fun DisposableEffect(
	key1 : Any?,
	effect : DisposableEffectScope.() -> DisposableEffectResult
) {
	remember(key1) { DisposableEffectImpl(effect) }
}
```

⇒ **key**값은 DisposableEffect가 재수행되는 것을 결정하는 파라미터,

    **Effect** 람다식은 DisposableEffectResult를 return 값으로 하는 식입니다.

이제 실제로 어떻게 사용하는지 알아보도록 하겠습니다.

```kotlin
DisposableEffect(key) {
//Composable이 제거될 때 Dispose 되어야 하는 효과 초기화
onDispose {
		//Composable이 Dispose될 때 호출되어 Dispose 되어야 하는 효과 제거 
	}
}
```

위 코드에서는 effect 블록은 처음에는 초기화 로직만 수행하고 이후에는 key값이 바뀔 때마다 onDispose블록을 호출한 후 초기화 로직을 다시 호출합니다.

여기서 주의할 점은 onDispose 블록의 리턴 값이 바로 DisposableEffect여서 onDispose 블록은 effect 람다식의 맨 마지막에 꼭 와야합니다.

```kotlin
@Composable
fun HomeScreen(
    lifecycleOwner: LifecycleOwner = LocalLifecycleOwner.current,
    onStart: () -> Unit, // Send the 'started' analytics event
    onStop: () -> Unit // Send the 'stopped' analytics event
) {
    // Safely update the current lambdas when a new one is provided
    val currentOnStart by rememberUpdatedState(onStart)
    val currentOnStop by rememberUpdatedState(onStop)

    // If `lifecycleOwner` changes, dispose and reset the effect
    DisposableEffect(lifecycleOwner) {
        // Create an observer that triggers our remembered callbacks
        // for sending analytics events
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_START) {
                currentOnStart()
            } else if (event == Lifecycle.Event.ON_STOP) {
                currentOnStop()
            }
        }

        // Add the observer to the lifecycle
        lifecycleOwner.lifecycle.addObserver(observer)

        // When the effect leaves the Composition, remove the observer
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }
}
```

**예시**

Activity의 onStart에서 시작되어 onStop에서 끝나야 하는 경우(백그라운드에서는 실행이 필요없는 경우)가 있다고 생각해봅시다. `rememberUpdatedStateon` 를 이용하여 onStart와 onStop에 대한 State를 저장하고  해당 라이프사이클에 맞는 case를 정의해줍니다. 

그리고 가장 중요한 onDispose에 observer를 제거해주는 코드를 작성해줍니다. 

**만약, `DisposableEffect` 가 아닌 `LaunchedEffect` 를 사용하여 구현했다면 어떤 것이 문제일까요?**

LaunchedEffect를 사용했을 경우 lifecycle이 바뀔 때마다 lifecycle Owner의 lifecycle에 붙는데 이 observer가 정리되는 부분이 없기때문에 observer은 계속해서 이전 lifecyclerOwner에 붙어 있을 것입니다. 즉 , onDispose를 이용하여 lifecylce이 바뀔 때 새로운 observer가 livecycle에 붙어 변화를 구독하고 composable이 제거될 때 observer 또한 정리되는 것입니다.

1. SideEffect :  Compose 상태를 비 Compose 코드에 게시하기
- Compose 상태를 Compose에서 관리하지 않는 객체와 공유하려면 recomposition 성공시마다 호출되는 SideEffect Composable를 사용해야 합니다.

```kotlin
@Composable
fun BackHandler(
    backDispatcher: OnBackPressedDispatcher,
    enabled: Boolean = true, // Whether back events should be intercepted or not
    onBack: () -> Unit
) {
    val backCallback = remember { /* ... */ }

    // On every successful composition, update the callback with the `enabled` value
    // to tell `backCallback` whether back events should be intercepted or not
    SideEffect {
        backCallback.isEnabled = enabled
    }
}
```

위 예시처럼 BackHandler 함수와 같이 콜백을 사용 설정해야 하는지 전달하려면 SidEffect를 사용하여 값을 업데이트 할 수 있습니다.

추가적으로 Compose는 위 3가지와 함께 사용할 수 있는 여러가지 CoroutineScope과 State관련 함수를 제공하는데요,

- rememberCoroutineScope : Composable의 CoroutineScope을 참조하여 외부에서 실행할 수 있도록 한다.
- rememberUpdateState : Launched Effect는 컴포저블의 State가 변경되면 재실행되는데 재실행되지 않아도 되는 State를 정의하기 위해 사용한다.
- produceState : Compose State가 아닌 것을 Compose의 State로 변환한다.
- derivedStateOf : State를 다른 State로 변환하기 위해 사용 Composable은 변환된 State에만 영향을 받는다.
- snapshotFlow : Composable의 State를 Flow로 변환한다.

도 같이 알아두고 공부하면 좋을 것 같습니다!!!


<br></br>
### 마무리

🧚🏻 지금까지 Composable의 Side Effect와 이를 처리하는 방법에 대해서 알아보았습니다.!!

12기 프로젝트에서 컴포즈를 처음으로 사용해보았는데요, 사실 깊이 있게 공부하지 않고 바로 적용해서 어려움이 있었고 다양하게 사용해보며 공부해봐야겠다는 생각을 하게되었습니다~!

 🚗다같이 컴포즈 마스터 해봅시다! 🚗 


<br></br>
참고

[https://developer.android.com/jetpack/compose/side-effects?hl=ko](https://developer.android.com/jetpack/compose/side-effects?hl=ko)