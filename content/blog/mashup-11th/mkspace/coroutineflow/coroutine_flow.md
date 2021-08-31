---
title: Coroutine Flow,Rx처럼 써보자!
date: "2021-08-31"
tags: ["mash-up", "StateFlow", "SharedFlow", "Rx vs Coroutine Flow"]
description: "Rx개발자의 시야에서 Coroutine Flow를 바라봤습니다."
cover: "./images/thumbnail.png"
---

# Coroutine Flow, Rx처럼 써보자!

때는 바야흐로 2020년 말 안드로이드 공식 문서를 보거나 새로 추가된 paging3를 도입하던 시기에 구글에서 Coroutine을 적극적으로 지원한다는 생각이 들었습니다. 공식 문서에 비동기 관련 샘플 코드들의 첫 장이 Coroutine인 점도 그렇고 paging3를 도입할 때에 Rx보다 Coroutine으로의 구현이 상대적으로 더 쉬워보였습니다. 이러한 생각으로 진행중이던 프로젝트에 Coroutine을 도입해 보았습니다. Rx 개발자가 Coroutine Flow를 도입하면서 불편했던 점 및 이를 해결한 과정에 대해 말씀드리려 합니다.

2021년 2월 **StateFlow, SharedFlow** 가 코틀린에 추가 되기 전 Rx의 Subject 클래스나 Processor 클래스처럼 새로운 값을 전달 할 때 수신자가 한 명인 경우 Channel, 여러 명인 경우 BroadcastChannel를 사용했습니다. 일반 Channel로 여러 곳에서 값을 받는경우 하나의 값에 대해 모두가 같은 값을 받는게 아닌 여러 수신자가 한번에 하나의 값을 각각 받게 설계가 되어있어 Rx 개발자의 감성으로는 도저히 이해하기 힘든 수준이었습니다. 

```kotlin
class SampleViewModel(): ViewModel() {
		private val sampleChannel: Channel<Boolean> = Channel(Channel.CONFLATED)
		val sampleReceiver: Flow<Boolean> = sampleChannel.receiveAsFlow()

		fun setSampleValue(sample: Boolean) {
				sampleChannel.offer(sample)
		}
}
```

또한 위의 예시처럼 receiver로는 Flow로 변환을 해줘야 했기 때문에 sender는 Channel, receiver는 Flow로 명시해줘야 했던 사소한 불편함 또한 존재했습니다.  (Channel에 관한 자세한 내용은 [여기](https://kotlinlang.org/docs/channels.html#channels-are-fair)를 참고해주세요.)

다행히 2월에 Stable 버전으로 release 된 Kotlin 1.4.1에서 새로 추가된 StateFlow와 SharedFlow가 이런 불편한 점을 다소 해결해 주었습니다. 먼저 이 두 종류의 Flow에 대해 알아보겠습니다.

## **StateFlow**

StateFlow는 Rx의 BehaviorSubject와 상당히 비슷합니다. 가장 최신의 값을 캐싱하고 있으며 등록된 collector 들에게 새로운 값을 전달하는 Flow 입니다. StateFlow는 SharedFlow의 한 종류이며 initial value를 갖고 있다는 특징이 있습니다.

더 다양한 특징으로는 이러한 것들이 있습니다.

- StateFlow는 initial value를 갖고 있기에 항상 값을 가지고 있고 value를 통해 현재 갖고 있는 값에 바로 접근할 수 있습니다.
- 기본적으로 같은 값은 emit 하지 않기에 distinctUntilChanged()이 사실상 포함되어 있습니다.
- 일반 Flow는 Cold Stream이기에 collector가 없는 경우 값을 emit하지 않지만 StateFlow는 Hot Stream이기에 collector가 없어도 생성 시 바로 활성화됩니다.
- 다만, SharingStarted를 통해 Lazy하게 활성화를 시킬 수 있습니다.

init block 에서 viewModel.launch를 통해 MutableStateFlow에 값을 내보내는 방식으로 StateFlow를 만들 수 있지만 Flow의 확장함수인 stateIn을 통해 Chaining 방식으로 StateFlow를 생성할 수 있습니다.

```kotlin
private val _user = MutableStateFlow<User?>(null)
val user = _user

init {
		// 단발성의 경우
		viewModelScope.launch(Dispatchers.IO) {
			val userId = userIdFlow.firstOrNull() ?: return@launch
			_user.emit(userRepository.fetchUser(userId))
		}

		// Stream의 경우
		userIdFlow.mapLatest { userId -> userRepository.fetchUser(userId) }
			.onEach(_user::emit)
			.flowOn(Dispatchers.IO)
			.launchIn(viewModelScope)
}

// stateIn을 사용한 경우
private val user: StateFlow<User?> = userIdFlow
		.mapLatest { userId -> userRepository.fetchUser(userId) }
		.flowOn(Dispatchers.IO)
		.stateIn(viewModelScope, SharingStarted.Lazily, null)
```

stateIn을 사용하면 불필요한 MutableStateFlow를 생성할 필요 없이 StateFlow를 생성할 수 있고 보기에도 더 깔끔해 보입니다.

```kotlin
 * @param scope the coroutine scope in which sharing is started.
 * @param started the strategy that controls when sharing is started and stopped.
 * @param initialValue the initial value of the state flow.
 *   This value is also used when the state flow is reset using the [SharingStarted.WhileSubscribed] strategy
 *   with the `replayExpirationMillis` parameter.
```

stateIn의 parameter는 다음과 같습니다. StateFlow이니 intialValue를 갖고 있으며 코루틴을 실행할 scope을 전달해줘야 하며 sharing을 시작할 stategy 또한 설정할 수 있습니다. 저처럼 Lazily를 사용하게 되면 collector가 등록이 되어야 비로소 활성화가 됩니다! 저는 ViewModel를 처음 생성할 때 무수히 많은 서버 콜을 줄이기 위해 Lazy하게 설정해줬습니다.

## **SharedFlow**

SharedFlow의 특징은 다음과 같습니다

- StateFlow와는 달리 replay 를 통해 캐싱하고 있을 값의 개수를 정할 수 있습니다.
- replay를 0으로 설정한다면 우리가 Rx에서 사용하던 PublishSubject의 역할과 비슷하게 만들 수 있습니다.
- Flowable의 BackPressure 전략과 같이 BufferOverFlow를 통해 버퍼가 가득 찬 경우의 대처법을 설정할 수 있습니다.

```kotlin
private val _dismissEvent = MutableSharedFlow<Unit>()
val dismissEvent: SharedFlow<Unit> = _dismissEvent.asSharedFlow()
```

위의 _dismissEvent는 SharedFlow의 replay가 default값인 0으로 세팅되기에 이전 값을 캐싱하지 않아 event를 전달하는 케이스에 사용되기 적합합니다.

shareIn의 parameter는 다음과 같습니다.

```kotlin
 * @param scope the coroutine scope in which sharing is started.
 * @param started the strategy that controls when sharing is started and stopped.
 * @param replay the number of values replayed to new subscribers (cannot be negative, defaults to zero).
```

shareIn은 stateIn과 다르게 전달할 이전 값의 개수를 정해주는 replay가 initialValue 대신 전달되어야 합니다.

확실히 이전에 Channel를 사용하던 때 보다 많이 편해지고 만족스러울 정도의 편의성을 제공한다는 걸 보며 참 빠르게 발전하는 언어라는 생각이 들었습니다. 더불어 Rx 개발자가 Coroutine Flow에 대해 쉽게 접근할 수 있도록 개발을 해 준 것에 대해 개발자 분들께 감사한 마음까지 생깁니다.

하지만 두 종류의 Flow를 사용할 때 **주의해야 할 점이** 있습니다. 둘 다 Flow이기에 firstOrNull를 통해 현재 값에 접근할 수 있는데 StateFlow는 initial value를 갖고 있기에 해당 StateFlow를 구성하는 스트림을 통해 값이 전달되었다고 보장할 수 없습니다. 그래서 보통 Nullable한 StateFlow를 구현하실때 의미없는 값인 null이 전달될 가능성이 존재하니 firstOrNull를 사용할 때면 해당하는 Flow가 해당 시점에 신뢰할 만한 값을 보내줄지에 대한 의심은 항상 하셔야 합니다. 이와 반대로 SharedFlow는 intial value가 없기에 최소 한 번은 자신의 Stream을 통해 값을 내보냅니다. 이는 비동기로 이루어지기 때문에 일시정지가 발생합니다. 그래서 SharedFlow의 경우엔 firstOrNull를 사용해 값에 접근할 경우 신뢰할 수 있는 값을 전달받은 반면 SteateFlow는 의미 없는 initial value인 null를 전달받을 수 있습니다.

StateFlow와 SharedFlow의 설계상 차이는 사실 그렇게 크지 않다고 생각합니다. StateFlow가 SharedFlow의 한 종류이기 때문입니다. 다만 initial value의 유무로 인한 차이 등 동작의 차이는 분명 존재하니 이 차이를 분명히 인지하시고 코드를 작성해야 할 것입니다.

또한, 예시코드를 보시면 Flow 또한 Rx처럼 Chaining Style를 지원한다는 걸 아실겁니다. 다만, operator의 이름이 조금 달라진 점에 차이점이 있지만 워낙 양이 방대하기에 이를 비교해보는 것은 다른 글에서 작성해 보도록 하겠습니다.

여기까지 Rx 개발자의 시야에서 본 Coroutine Flow에 대해 소개를 드렸습니다. 마지막으로 Flow 부분의 공식 문서에서 개발자분들이 남긴 글귀를 인용하며 마치도록 하겠습니다.

## **Flow and Reactive Streams**

For those who are familiar with [Reactive Streams](https://www.reactive-streams.org/) or reactive frameworks such as RxJava and project Reactor, design of the Flow may look very familiar.

Indeed, its design was inspired by Reactive Streams and its various implementations. But Flow main goal is to have as simple design as possible, be Kotlin and suspension friendly and respect structured concurrency. Achieving this goal would be impossible without reactive pioneers and their tremendous work. You can read the complete story in [Reactive Streams and Kotlin Flows](https://medium.com/@elizarov/reactive-streams-and-kotlin-flows-bfd12772cda4) article.

While being different, conceptually, Flow *is* a reactive stream and it is possible to convert it to the reactive (spec and TCK compliant) Publisher and vice versa. Such converters are provided by `kotlinx.coroutines` out-of-the-box and can be found in corresponding reactive modules (`kotlinx-coroutines-reactive` for Reactive Streams, `kotlinx-coroutines-reactor` for Project Reactor and `kotlinx-coroutines-rx2`/ `kotlinx-coroutines-rx3` for RxJava2/RxJava3). Integration modules include conversions from and to `Flow`, integration with Reactor's `Context` and suspension-friendly ways to work with various reactive entities.