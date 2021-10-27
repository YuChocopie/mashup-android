---
title: "android 중복클릭 방지 - ex) 좋아요 기능"
date: "2021-08-30"
tags: ["Mash-up 11th", "kotlin", "android", "throttleFirst", "debounce"]
description: "어떻게 하면 좋아요 기능을 효율적으로 구현할 수 있을까요?"
cover: "./summaryImage.png"
---


## 좋아요 기능이란?

이 글을 읽으시는 분들 모두 좋아요 기능이 어떤 기능인 지 아실 것이라고 생각되서 설명드리기 민망하지만, 일반적으로 하트 모양의 버튼을 클릭을 하면 **좋아요** 혹은 **좋아요 취소** 요청을 서버로 보내 UI를 업데이트하는 방식일 것입니다! 


그런데 문제는 클릭 액션은 발생하기 굉장히 쉽다는 것입니다. 좋아요를 눌렀다가 다시 좋아요 취소 요청을 보내는 이러한 상황은 한번이 아니라 여러번 발생할 수 있습니다. 좋아요 기능은 클릭할 때마다 상태가 변경되고 그에 따른 서버 요청들의 결과들을 UI에 표시해 주어야 하는데 단순 클릭 리스너를 사용하면 정확하게 동기화 시키는 것은 쉽지 않습니다.


이 문제를 어떻게 해결해야 할까요? 하나씩 알아봅시다


## Class로 정의하기

```kotlin
class SingleClick (
	private val intervalTime: Long,
	private val action: (View?) -> Unit
): View.OnClickListener {
	private var lastClickTime: Long = 0
	
	override fun onClick(view: View?) {
		val systemTime = System.currentTimeMillis()
		if (systemTime - lastClickTime > intervalTime) {
			lastClickTime = systemTime
			action.invoke(view)
		}
	}
}
```



**가장 간단한 생각해 낼 수 있는 구현 방법이고 잘 동작하는 방법이에요!**

`System.currentTimeMillis` Java에서 부터 제공된 기능 중 하나로 **프로세스에서 실제 세계 시간**을 밀리초 기준으로 가져오는 함수입니다. 보통 달력 기능을 구현하거나 날짜 비교를 할 때 사용한다고 해서 중복 클릭에서 사용하기에는 약간 너무 too much 하다고 생각이 든다면 <br>

`System.uptimeMillis()` 함수를 사용하셔도 좋을 듯 합니다. 위 함수는 시스템(cpu)이 부팅되고 나서부터 기록된 시간을 밀리초 기준으로 가져온다고 합니다!



### 문제점

- **가독성** - 비교적 코드를 보는 모두가 동일한 이해 관계를 가지기 쉽지 않을 듯 하다. Action을 넘겨주는 방법, 심지어는 Class Name 등을 구현하는 개발자마다 모두 다를 확률이 적지 않기 때문이다.
-  **액션 취소** - 안드로이드의 중요한 개념인 라이프 사이클. 뷰는 언제든 종료될 수 있고 생성될 수 있다. 어떠한 액션을 요청하고 특정 이유로 뷰가 소멸되었을 때는 앞서 요청한 액션이 불필요하게 될 수 있어 취소를 요청하고 싶지만 위 방법은 **취소를 구현하기가 어렵다.**


## ReactiveX로 구현해보기


<img src ="./throttle_first.png" width="500">



안드로이드 플랫폼에서 비동기 라이브러리로 쓰고 있는 Rx는 데이터 흐름을 스트림 형태로 전송하고 이 스트림을 **Observe**하는 형태입니다. 

Rx 함수 중, `throttleFirst`는 **일정 시간 구간(Timeslot) 동안 발생한 이벤트 중 첫 번째로 발생한 이벤트만 통과시키고, 나머지 이벤트를 무시합니다.** 뷰의 클릭 액션이 발생할 때 마다 Rx 스트림으로 데이터를 보낸다고 생각하시면 됩니다!  


```kotlin
abstract class BaseActivity {
		private val compositeDisposable = CompositeDisposable()
		
		protected fun Disposable.addDisposable() {
       compositeDisposable.add(this)
    }
		
		override fun onDestory() {
				super.onDestory()
				compositeDisposable.dispose()
		}
}


//SampleViewModel.kt///////////////////////////

@HiltViewModel
class SampleViewModel @Inject constructor(): ViewModel() {
  val clickSubject: PublishSubject<Unit> = PublishSubject.create()
  
  fun requestAction() {
    	clickSubject.onNext(Unit)
  }
}


//SampleActivity.kt////////////////////////////


@AndroidEntryPoint
class SampleActivity: BaseActivity(): {
  ...
  private val viewModel: SampleViewModel by viewModels()
  ...
  
  private fun setUi {
    viewBinding.button.setOnClickListenr {
      viewModel.requestAction()
    }
  }
  
  private fun observeViewModel() {
    viewModel.clickSubject
    		.throttleFirst(intervalSecond, TimeUnit.SECONDS)
        .subscribe {
            action.invoke(this)
        }.addDisposable()
  }
}

```


Rx의 Disposable은 subscribe 함수의 반환 값으로 스트림의 구독을 해제하는 `dispose`와 `clear` 함수를 가지고 있는 인터페이스입니다. 우리는 이 두 함수로 뷰가 소멸되었을 때 간단히 비동기 액션 요청을 취소 할 수 있습니다! 

Android Activity에서는 클릭 액션을 수행하는 UX가 빈번하게 있을 수 있어 그에 따른 **여러개의 Disposable 관리**도 중요해집니다. 그럴 때 여러개의 Disposable을 리스트 자료구조에 저장하여 한번에 dispose와 clear를 해주는 `CompositeDisposable` 를 사용하시면 더 좋을 듯 합니다.  


```kotlin
//ViewExt
fun View.setThrottleFirstClickListenr(
  	 activity: BaseActivity,
     intervalSecond: Long = 1,
     action: (View) -> Unit
) {
   val disposable = RxView.clicks(this)
         .throttleFirst(intervalSecond, TimeUnit.SECONDS)
         .subscribe {
                action.invoke(this)
          }
   activity.addDisposable(disposable)
}

```

추가적으로 `RxBinding` 라이브러리에서 뷰의 클릭 액션을 스트림으로 변환해주는 `clicks` 함수를 제공해준다고 합니다. 그리고 throttleFirst 뿐만 아니라 **debounce, buffer** 등 각 상황마다 알맞은 Rx 함수들을 찾아 사용하시길 바랍니다.

<br></br>

### 문제점

- 높은 진입 장벽. Rx라는 라이브러리에 대해서 구조와 동작 방식에 대해 이해하고 있어야 한다. 
- Rx에서 제공해주는 함수들로 기능들을 적절하게 구현할 수 있지만 보일러플레이트 코드들이 비교적 많이 존재하게 된다.


## Kotlin Flow로 구현해 보기

```kotlin
@ExperimentalCoroutinesApi
fun View.clicks(): Flow<Unit> = callbackFlow {
	setOnClickListener {
		offer(Unit)
	}
	awaitClose { setOnClickListener(null) }
}
```

Kotlin Flow는 Rx와 매우 유사하게 데이터를 스트림 형태로 전송하고 변환하는 기능을 제공해줍니다. 위에서 사용된 `callbackFlow`는 Firebase 처럼 콜백 기반 API의 결과를 Flow 스트림으로 전송할 때 사용하고 콜백과 유사한 클릭 리스너에서도 동일하게 사용할 수 있습니다. `close`가 호출될 때 까지 지연하여`offer` 함수를 통해 데이터를 흐름으로 계속 전송합니다.  `RxView.clicks` 처럼 단순히 클릭 스트림을 생성하는 코드라고 보시면 됩니다 :)



```kotlin
button.clicks()
.debounce(1000) //1초
.onEach {
     println("clicked") 
}.launchIn(LifecycleScope)
```


Flow 스트림을 구독하는 부분은 Rx와 매우 유사합니다. 이번에는 `Debounce`를 사용하여 구현해볼까요? 

`Debounce`는 throttleFirst와 개념이 약간 다릅니다. 일정시간마다 최초의 한번의 데이터만 전달되는 throttleFirst와 달리 Debounce는 데이터가 입력된 후 **일정 시간 내에 데이터가 들어오면 이전 데이터는 취소하고 새로운 데이터가 전송되는 방식**입니다. 에를 들어. 일정 시간의 단위가 1초고 0.9초마다 계속 입력이 들어온다면 throttleFirst는 적어도 1초마다 1번의 데이터가 전송되는 것을 보장하지만, debounce는 1초 이내 추가적인 데이터 요청이 없을 때까지 계속 지연됩니다. 따라서 데이터를 못받고 게속 기다리는 상태가 될 수도 있습니다.


```kotlin
@ExperimentalCoroutinesApi
fun View.clicks(onUiUpdate: (() -> Unit)? = null): Flow<Unit> = callbackFlow {
	setOnClickListener {
		onUiUpdate?.invoke()
		offer(Unit)
	}
	awaitClose { setOnClickListener(null) }
}
```

좋아요 기능은 debounce 동작 방식으로 구현하면 다소 어색할 수 있습니다. 좋아요에 따른 UI는 즉각적으로 바뀌어야 하니까요. 그래서 여기서부터는 제 생각이 담긴 코드입니다. 더 좋은 개선 방향이 있으면 말씀해주세요. 위 코드를 조금 수정해보았습니다. 


Flow는 코루틴 스코프를 통해 불필요한 액션을 취소할 수 있습니다. 바로 `launchIn` 함수인데요. Flow는 매개변수로 전달되는 코루틴 스코프의 수명주기에 맞춰집니다.















