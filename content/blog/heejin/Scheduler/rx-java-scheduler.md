
---
title: "RxJava - Scheduler"

date: "2021-01-27"

tags: ["huijiny", "mash-up", "rxjava", "scheduler"]

description: "비동기 프로그래밍을 편하게 하는 rxjava의 스케쥴러들에 대해서 알아봅시다!"

cover: "./희진rx.png"

---

안녕하세요 여러분!
유희진입니다 - ! 
다들 2021년 잘 보내고 계신가요ㅎ(?)

이번에는 rxjava에서 비동기 프로그래밍을 쉽게 만들어주는 친구인 **스케줄러**의 종류와 쓰임새, 예시코드에 대해서 들고왔습니다!

## 5.1 스케줄러의 특징

(스터디에서) 앞서 배웠던 코드들의 예시는 모두 main에서 진행되었어요.
하지만 실무에서 요구사항에 맞게 코드를 비동기로 동작할 수 있도록 작성해야하는데, 이 때 스케쥴러를 이용합니다.
Rxjava에서 Observable만큼 중요한 친구입니다.


**특징**

1. 스케줄러는 Rxjava 코드를 어느 스레드에서 실행할지 지정할 수 있습니다.
2. subscribeOn()함수와 observeOn()함수를 모두 지정하면 데이터 흐름이 발생하는 스레드와 처리된 결과를 구독자에게 발행하는 스레드를 분리할 수 있습니다.
3. subscribeOn()함수만 호출하면 Observable의 모든 흐름이 동일한 스레드에서 실행됩니다.
4. 스케줄러를 별도로 지정하지 않으면 현제스레드에서 동작을 실행합니다.



## 5.2 스케줄러의 종류

- 상황에 따라서 다양한 스케줄러를 제공합니다!
- RxJava → 특정 스케줄러를 사용하다가 다른 스케줄러로 변경하기 쉽습니다🙂



#### RxJava의 버전별 스케쥴러 종류

<img src='./kinds_of_scheduler.png'/>.



### 5.2.1 뉴 스레드 스케줄러

- 새로운 스레드를 생성
- 새로운 스레드를 만들어 어떤 동작을 실행하고 싶을 때 Schedulers.newThread()를 인자로 넣어주면 됌
- 그러면 요청을 받을 때마다 새로운 스레드를 생성



**예제**

```java
String[] orgs = {RED, GREEN, BLUE};
Observable.fromArray(orgs)
   .doOnNext(data -> Log.v("Original data : " + data))
   .map(data -> "<<" + data + ">>")
   .subscribeOn(Schedulers.newThread()) // 여기를 보세요~
   .subscribe(Log::i);       
CommonUtils.sleep(500);

Observable.fromArray(orgs)
   .doOnNext(data -> Log.v("Original data : " + data))
   .map(data -> "##" + data + "##")
   .subscribeOn(Schedulers.newThread()) // 여기를 보세요~
   .subscribe(Log::i);       
CommonUtils.sleep(500);
```



**결과**

```java
RxNewThreadScheduler-1 | Original data : 1
RxNewThreadScheduler-1 | value = <<1>>
RxNewThreadScheduler-1 | Original data : 3
RxNewThreadScheduler-1 | value = <<3>>
RxNewThreadScheduler-1 | Original data : 5
RxNewThreadScheduler-1 | value = <<5>>
RxNewThreadScheduler-2 | Original data : 1
RxNewThreadScheduler-2 | value = ##1##
RxNewThreadScheduler-2 | Original data : 3
RxNewThreadScheduler-2 | value = ##3##
RxNewThreadScheduler-2 | Original data : 5
RxNewThreadScheduler-2 | value = ##5##
```



### 5.2.2 계산스케줄러

- RxJava에서 추천하는 스케줄러(계산, IO, 트램펄린) 중 1
- CPU에 대응하는 계산용 스케줄러.
- 계산 작업을 할 때는 대기 시간이 없이 빠르게 결과를 도출하는 것이 중요하다는 것.
- 입출력 작업을 하지 않는 스케줄러
- 내부적으로 스레드 풀 생성 및 스레드 개수는 프로세서 개수와 동일



**interval() 예시**

```java
@SchedulerSupport(SchedulerSupport.COMPUTATION)
public static Observable<Long> interval(long period, TimeUnit unit)
```

interval() 함수는 기본적으로 계산 스케줄러에서 동작합니다. 물론 내가 원하는 스케줄러에서 동작하도록 변경할 수도 있습니다.



```java
@SchedulerSupport(SchedulerSupport.CUSTOM)
public static Observable<Long> interval(
long period, TimeUnit unit, Scheduler scheduler)
```

CUSTOM은 개발자가 원하는 스케줄러를 지정할 수 있다는 의미입니다. 리액티브 함수 대부분 마지막 인자로 스케줄러를 지정할 수 있습니다.

단,  flatMap(), scan() 함수 등 대표적인 연산자지만 스케쥴러를 인자로 받지 않는 경우도 있으니 참고!!



**예시**

```java
String[] orgs = {RED, GREEN, BLUE};
		Observable<String> source = Observable.fromArray(orgs)
			.zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), 
					(a,b) -> a);
		
		//Subscription #1 
		source.map(item -> "<<" + item + ">>")
			.subscribeOn(Schedulers.computation())
			.subscribe(Log::i);		
		
		//Subscription #2
		source.map(item -> "##" + item + "##")
			.subscribeOn(Schedulers.computation())		
			.subscribe(Log::i);		
		CommonUtils.sleep(1000);
		CommonUtils.exampleComplete();
```



**결과**

```java
RxComputationThreadPool-3 | value = ##1##
RxComputationThreadPool-4 | value = <<1>>
RxComputationThreadPool-4 | value = <<3>>
RxComputationThreadPool-3 | value = ##3##
RxComputationThreadPool-3 | value = ##5##
RxComputationThreadPool-4 | value = <<5>>
```



### 5.2.3 IO 스케줄러

- 계산 스케줄러와는 다르게 네트워크 상의 요청을 처리하거나 각종 입, 출력 작업을 실행하기 위한 스케줄러
- 기본으로 생성되는 수가 계산 스케줄러와 다른데, IO스케줄러는 필요할 때마다 스레드를 계.속. 생성



**예시**

```java
String root = "c:\\\\";
		File[] files = new File(root).listFiles();		
		Observable<String> source = Observable.fromArray(files)
				.filter(f -> !f.isDirectory())
				.map(f -> f.getAbsolutePath())
				.subscribeOn(Schedulers.io());
		
		source.subscribe(Log::i);
		CommonUtils.sleep(500);
		CommonUtils.exampleComplete();
```



**결과**

```java
RxCachedThreadScheduler-1 | value = c:\\bootmgr
RxCachedThreadScheduler-1 | value = c:\\bootmgr
RxCachedThreadScheduler-1 | value = c:\\bootmgr
RxCachedThreadScheduler-1 | value = c:\\bootmgr ...
```



### 5.2.4 트램펄린 스케줄러

- 새로운 스레드를 생성하지 않고 현재 스레드에 무한한 크기의 대기 행렬(queue)을 생성하는 스케줄러



**예시**

```java
String[] orgs = {"RED", "GREEN", "BLUE"};		
		Observable<String> source = Observable.fromArray(orgs);
		
		//Subscription #1 
		source.subscribeOn(Schedulers.trampoline())
				.map(data -> "<<" + data + ">>")
				.subscribe(Log::i);
		
		//Subscription #2 
		source.subscribeOn(Schedulers.trampoline())
				.map(data -> "##" + data + "##")
				.subscribe(Log::i);
		CommonUtils.sleep(500);		
		CommonUtils.exampleComplete();
```



**결과**

```java
main | value = <<RED>>
main | value = <<GREEN>>
main | value = <<BLUE>>
main | value = ##RED##
main | value = ##GREEN##
main | value = ##BLUE##
```

- 새로운 스레드를 생성하지 않고 main 스레드에서 모든 작업을 실행합니다.
- 큐에 작업을 넣은 후 1개씩 꺼내어 동작해 첫번째 구독과 두번째 구독의 실행 순서가 바뀌는 경우가 발생하지 않습니다!



### 5.2.5 싱글 스레드 스케줄러

- Rxjava 내부에서 단일 스레드를 별도로 생성하여 구독 작업을 처리함
- 생성된 스레드는 여러 번 구독 요청이 와도 공통으로 사용
- 하지만 리액티브 프로그래밍은 비동기 프로그래밍을 지향하기 때문에 싱글 스레드 스케줄러를 활용할 확률은 낮음.



**예제**

```java
Observable<Integer> numbers = Observable.range(100, 5);
		Observable<String> chars = Observable.range(0, 5)
				.map(CommonUtils::numberToAlphabet);		
		
		numbers.subscribeOn(Schedulers.single())
				.subscribe(Log::i);
		chars.subscribeOn(Schedulers.single())
				.subscribe(Log::i);		
		CommonUtils.sleep(500);
		CommonUtils.exampleComplete();
```



**결과**

```java
RxSingleScheduler-1 | value = 100
RxSingleScheduler-1 | value = 101
RxSingleScheduler-1 | value = 102
RxSingleScheduler-1 | value = 103
RxSingleScheduler-1 | value = 104
RxSingleScheduler-1 | value = A
RxSingleScheduler-1 | value = B
RxSingleScheduler-1 | value = C
RxSingleScheduler-1 | value = D
RxSingleScheduler-1 | value = E
```

- 싱글 스레드 스케줄러에서 실행하면 여러개 Observerable이 있어도 별도 마련해놓은 단일 스레드에서 차례로 실행합니다.
- 트렘펄린 스케줄러예제와 비교해보면 실행 스레드가 다르다는 것을 알 수 있다. `RxSingleScheduler-1` 에서 실행됩니다.



### 5.2.6 Executor 변환 스케줄러

- `java.util.current` 패키지에서 제공하는 `Executor`를 변환하여 스케줄러를 생성할 수 있음
- 하지만 추천 X
- 기존에 `Executor` 클래스를 재사용할 때만 한정적으로 활용하길



**예제**

```java
final int THREAD_NUM = 10;
		
		String[] data = {"RED", "GREEN", "BLUE"};
		Observable<String> source = Observable.fromArray(data);
		Executor executor = Executors.newFixedThreadPool(THREAD_NUM);
		
		source.subscribeOn(Schedulers.from(executor))
				.subscribe(Log::i);
		source.subscribeOn(Schedulers.from(executor))
				.subscribe(Log::i);
		CommonUtils.sleep(500);		
		CommonUtils.exampleComplete();
```



**결과**

```java
pool-1-thread-2 | value = RED
pool-1-thread-1 | value = RED
pool-1-thread-2 | value = GREEN
pool-1-thread-1 | value = GREEN
pool-1-thread-1 | value = BLUE
pool-1-thread-2 | value = BLUE
```

- 고정개수 10개 스레드풀 생성합니다.
- 각 Observable에 `subscribeOn()`함수 호출해 Executor 스케줄러 지정합니다.
- 만약 `Executors.newSingleThreadExecutor()`로 생성했으면, 실행 결과가 2개 스레드가 아니라 1개 스레드에서 모두 실행합니다.



## 5.3 스케줄러를 활용해 콜백 지옥 벗어나기

**CallbackHell**

```java
public class CallbackHell {
	private static final String FIRST_URL = "<https://api.github.com/zen>";
	private static final String SECOND_URL = GITHUB_ROOT + "/samples/callback_hell";

	private final OkHttpClient client = new OkHttpClient();
	
	private Callback onSuccess = new Callback() {
		@Override
		public void onFailure(Call call, IOException e) {
			e.printStackTrace();
		}

		@Override
		public void onResponse(Call call, Response response) throws IOException {
			Log.i(response.body().string());
		} 
	};
	
	public void run() { 
		Request request = new Request.Builder()
		        .url(FIRST_URL)
		        .build();
		client.newCall(request).enqueue(new Callback() {
			@Override
			public void onFailure(Call call, IOException e) {
				e.printStackTrace();
			}

			@Override
			public void onResponse(Call call, Response response) throws IOException {
				Log.i(response.body().string());
				
				//add callback again
				Request request = new Request.Builder()
				        .url(SECOND_URL)
				        .build();
				client.newCall(request).enqueue(onSuccess);				
			}			
		});		
	}
		
	public static void main(String[] args) { 
		CallbackHell demo = new CallbackHell();
		demo.run();
	}
}
OkHttp <https://api.github.com/>... | value = Keep it logically awesome.
OkHttp <https://raw.githubuserc>... | value = Welcome to Callback Hell!!
```



**CallbackHeaven - Using concatWith**

```java
CommonUtils.exampleStart();
		Observable<String> source = Observable.just(FIRST_URL)
			.subscribeOn(Schedulers.io())
			.map(OkHttpHelper::get)
			.concatWith(Observable.just(SECOND_URL)
					           .map(OkHttpHelper::get));
		source.subscribe(Log::it);
		CommonUtils.sleep(5000);
		CommonUtils.exampleComplete();
RxCachedThreadScheduler-1 | 1698 | value = Keep it logically awesome.
RxCachedThreadScheduler-1 | 2177 | value = Happy Callback Heaven by RxJava2!!
```

내가 호출하는 첫 번째 URL과 두 번째 URL에 대한 코드가 한눈에 보입니다.

concatWith() 함수는 concat() 함수와 기능이 동일합니다.

앞서 코드에서 `OkHttpClient`의 `enqueue()`메서드를 호출해서 콜백을 전달받았지만, 이 코드에서는 `OkHttlClient.get()` 메서드 안에서 `OkHttpClient`의 `execute()`메서드를 호출합니다.

IO 스케줄러로 별도의 스레드에서 네트워크를 호출합니다.



**장점?**

- 선언적 동시성 : 순수한 비즈니스 로직과 비동기 동작을 위한 스레드 부분을 구별할 수 있도록 해줍니다.
- 가독성: 정상적인 로직과 향후 예외 처리 부분을 말끔하게 분리할 수 있도록 해줍니다.



**CallbackHeaven 동시성 네트워크 호출 - using Zip**

만약 첫 번째 URL과 두 번째 URL 요청을 동시에 수행하고 결과만 결합하면 어떨까?

첫 번째의 응답을 기다리지 않고 두 번째 URL 호출을 시작할 수 있기 때문에 성능 향상을 기대할 수 있습니다!

```java
CommonUtils.exampleStart();
		Observable<String> first = Observable.just(FIRST_URL)
				**.subscribeOn(Schedulers.io())**
				.map(OkHttpHelper::get);
		Observable<String> second = Observable.just(SECOND_URL)
				**.subscribeOn(Schedulers.io())**
				.map(OkHttpHelper::get);
		
		**Observable.zip(first, second, 
				(a, b) -> ("\\n>>" + a + "\\n>>" + b))**
			.subscribe(Log::it);
		CommonUtils.sleep(5000);
```

Observable을 2개로 나눈다고 생각하는 것이 중요합니다.



**결과**

```java
RxCachedThreadScheduler-2 | 1532 | value = 
>>Keep it logically awesome.
>>Happy Callback Heaven by RxJava2!!
```

**스케줄러를 활용하면 비지니스 로직과 비동기 프로그래밍을 분리할 수 있기 때문에 프로그램의 효율을 향상시킬 수 있습니다.**😎



## 5.4 observeOn()함수의 활용

RxJava 스케줄러의 핵심 : 스케줄러의 종류를 선택 → subscribeOn()과 observeOn() 함수를 호출하는 것



- **subscribeOn() : Observable에서 구독자가 subscribe()함수를 호출했을 때 데이터의 흐름을 발행하는 스레드를 지정**
- **observeOn() : 처리된 결과를 구독자에게 전달하는 스레드**

![ObserveOn and SubscribeOn](http://reactivex.io/documentation/operators/images/schedulers.png)



- subscribeOn(파란색 스레드) 를 호출했을 때는 데이터를 발행하는 첫 줄이 스레드 A에서 실행됩니다. 이후에는 observeOn()함수가 호출될 때까지 스레드 A에서 실행됩니다.
- observeOn(B)를 호출하면 그 다음인 두 번째 줄부터는 스레드 B에서 실행됩니다.
- map(o—>ㅁ)함수는 스레드 변경과는 상관 없으므로 세 번째 줄은 계속해서 스레드 B 실행을 유지합니다.
- 이제 observeOn(C)함수를 호출하면 그 다음 데이터 흐름은 스레드 C에서 실행됩니다.



**요약하면,**

1. **subscribeOn()함수는 한 번 호출했을 때 결정한 스레드를 고정하며 이후에는 다시 호출해도 스레드가 바뀌지 않습니다.**
2. **observeOn()은 여러번 호출할 수 있으며 호출되면 그 다음부터 동작하는 스레드를 바꿀 수 있습니다.**



## 5.5 마치며

1. **스케줄러는 선언적 비동기로 프로그래밍을 할 수 있도록 해줍니다.**
2. **IO, Computation, Trampoline을 활용해 개별적으로 스레드 만들지 않아도 비동기 프로그래밍 가능합니다.(이외의 다른 스케줄러는 한정적으로 사용한다 함)**
3. **subscribeOn(), observeOn()함수 활용해 내가 원하는 스레드를 원하는 코드에 선별적으로 적용할 수 있습니다.**

끝 유후~😉