---
title: RxAndroid (1)
date: "2021-02-16"
tags: ["RxJava", "mash-up", "seohui", "study"]
description: "RxAndroid RxJava 활용 (1)."
cover: "./cover4.png"
---

# **6장. 1 - RxAndroid 소개**

### **RxAndroid 소개**

#### RxAndroid

- **Observable** : 비즈니스 로직을 이용해 데이터를 발행

- **구독자** : Observable에서 발행한 데이터를 구독

- **스케줄러** : 스케줄러를 통해 Observable, 구독자가 어느 스레드에서 실행될지 결정.

  

#### **기존 안드로이드** 문제점

- 안드로이드의 비동기 처리 및 에러 핸들링
- 수많은 핸들러와 콜백 때문에 발생하는 디버깅 문제
- 2개의 비동기 처리 후 결과를 하나로 합성하는 작업
- 이벤트 중복 실행.

#### **RxAndroid 장점**

- 간단한 코드로 복잡한 병행 프로그래밍이 가능
- **비동기 구조에서 에러를 쉽게 다룸**
- 함수형 프로그래밍 기법도 부분적 적용 가능



#### **RxLifecycle 라이브러리**

안드로이드와 UI 라이프 사이클을 대체한다기보다 구독할 때 발생할 수 있는 **메모리 누수를 방지하기 위해 사용**한다.

**완료하지 못한 구독을 자동으로 해제**(dispose)한다.



```
public class RxAndroidSample extends RxAppCompatActivity {

	...	
    
	private Unbinder mUnbinder;

	@Override
	void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		mUnbinder = ButterKnife.bind(this);
        
		Observable.just("RxAndroid").compose(bindToLifeCycle()).subscribe(Log::i);
	}


	@Override
	void onDestroy() {
		super.onDestroy();
		if (mUnbinder != null) {
			mUnbinder.unbind();
		}
	}
}
```

보통 사용하는 **AppCompatActivity 클래스 대신 RxAppCompatActivity 클래스를 상속**하도록 소스코드를 수정해야 한다.

또한, Observable 생성 부분에 **compose()를 사용하여 라이프 사이클을 관리**한다.

Observable은 RxAndroidSample 클래스가 종료되면 자동으로 해제(dispose)가 된다.

해당 내용은 메모리 누수와 관련이 높으므로 마지막장에 가서 추가적으로 살펴보겠습니다.

 

### **UI 이벤트 처리**

View 클래스 안에는 UI 이벤트를 처리하기 위한 몇 가지 콜백 메서드가 존재. 이벤트리스너라고 하는 인터페이스 모음.

#### **이벤트 리스너**

이벤트 리스너는 콜백 메서드 하나를 포함하는 뷰 클래스 안의 인터페이스.

onClick(), onLongClick(), onFocusChange(), onKey(), onTouch(), onCreateContextMenu() 가 존재한다.

책의 예제는 이 중 onClick() 메서드에 Observable 을 활용한 예제를 다루고 있습니다. 



**예제 확인

코드 6-8 => 코드 6-9, 6-10

8: subscribe() 의 함수 인자로 View 객체를 전달

10. RxView사용하여 명시적인 옵저버블 생성 필요없이 클릭 리스너 설정도 내부에서 자동처리되어 코드가 직관적이고 가독성도 향상. 



 \* **액티비티 중복 실행 문제 해결 방법**

빠른 시간 안에 액티비티의 실행을 다시 요청하면, **singleTop의 경우에도 액티비티는 중복 실행** 된다. 이 때, **debounce() 함수를 사용하면 쉽게 문제를 해결**할 수 있다.



```
...

@Override
public void onActivityCreate(Bundle savedInstanceState) {
	super.onActivityCreate(savedInstanceState);
    
	mDisposable = getObservable()
	.debounce(1000, TimeUnit.MILLISECONDS)
	.observeOn(AndroidSchedulers.mainThread())
	.subcribe(s -> ... );
    
    ...
}   
```

 

debounce 함수는 빠르게 연속 이벤트를 처리하는 흐름 제어 함수이다.

계산 스케줄러에서 동작하며, 어떤 이벤트가 입력되고 timeout에서 지정한 시간동안 추가 이벤트가 발생하지 않으면 마지막 이벤트를 최종적으로 발행한다.

즉, **지정한 시간동안 발생한 이벤트 중 마지막 이벤트를 발행**하는 방식이다.

 

따라서, 액티비티를 빠르게 여러번 요청할 경우에도 지정한 시간동안 발생한 이벤트 중 마지막 이벤트만 발행하므로 중복 실행 문제를 해결할 수 있다.

 

*실습예제 - 예제 p216

**안드로이드에서 UI 업데이트는 UI 스레드에서만 가능하다.**

즉, **.observeOn(AndroidSchedulers.mainThread()) 를 사용**하여 구독자의 스레드가 **메인(UI) 스레드임을 명시**해준다.

이 부분을 **생략하면 WrongThreadException 이 발생**한다.



```
#### reference
https://heegs.tistory.com/20?category=784135
---

Rxjava 프로그래밍 
https://aroundck.tistory.com/6227
https://github.com/yudong80/reactivejava/tree/master/chapter06/rxAndroid
Rxjava 프로그래밍
(https://github.com/yudong80/reactivejava/tree/master/chapter06/rxAndroid)


```

