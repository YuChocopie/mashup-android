---
title: Reactive - 생성 연산자
date: "2021-01-20"
tags: ["rx", "rxJava", "yuchocopie", "Create Operator"]
description: "생성 연산자중 interval(), timer(), range(),  intervalRange(), defer(), repeat() 에  대해 살펴봅시다."
cover: "./ic_cover.png"
---

# Reactive - 생성 연산자

리액티브 연산자

- 생성연산자: Observable로 데이터 흐름을 만든다

- 변환연산자, 필터 연산자: 데이터 흐름을 원하는 방식으로 변형

- 결합연산자: 1개의 Observer이 아니라 여러 개의 Observable을 조합할 수 있도록 해준다

| 연산자 종류      | 연산자 함수                                                                                       |
| :--------------- | :------------------------------------------------------------------------------------------------ |
| **생성 연산자**  | just(), fromXXX(), create(), **interval(), range(), timer(), intervalRange(), defer(), repeat()** |
| 변환 연산자      | map(), flatMap(), concatMap(), switchMap), groupBy(), scan(), buffer(), window()                  |
| 필터 연산자      | filter(), take(), skip(), distinct()                                                              |
| 결합 연산자      | zip(), combineLatest(), Merge(), concat()                                                         |
| 조건 연산자      | amb(), takeUntil(), skipUntil(), all()                                                            |
| 에러 처리 연산자 | onErrorReturn(), onErrorResumeNext(), retry(), retryUntil()                                       |
| 기타 연산자      | subscribe(), subscribeOn(), observeOn(), reduce(), count()                                        |

# 생성연산자

생성연산자 데이터 흐름을 만드는 것으로 간단히 Observable(Observable, Single, Maybe 객체 등)을 만든다고 생각하면 됩니다.

이번에는 생성 연산자중 interval(), timer(), range(), intervalRange(), defer(), repeat() 에 대해 살펴봅시다.

### 1. interval() 함수

interval() 함수는 일정 시간 간격으로 데이터 흐름을 생성합니다. 주어진 시간 간격만큼 Interval을 둔 정수 시퀀스를

<img src="http://reactivex.io/documentation/operators/images/interval.c.png" alt="간격" style="zoom:67%;" />

주로 사용하는 원형에는 2가지가 있습니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.COMPUTATION)
public static Observable<Long> interval(long period, TimeUnit unit)
public static Observable<Long> interval(long initialDelay, long period, TimeUnit unit)
//, Scheduler scheduler)
```

첫 번째 원형은 **일정 시간(period)**을 쉬었다가 데이터를 발행합니다.

두 번째 원형은 동작은 같지만 **최초 지연시간(initialDelay)**을 조절할 수 있습니다.

`@SchedulerSupport(SchedulerSupport.COMPUTATION)` 애너테이션은 interval() 함수의 동작이 계산스케쥴러(Computation Scheduler) 에서 실행된다는 의미로 현재 스레드가 아닌 계산을 위한 별도의 스레드(rx에서는 별도의 스레드를 스케쥴러라 한다)에서 동작하는 것을 의미합니다.

> 어노테이션이라고 많이 읽는었는데 애너테이션이라 읽는거였군요

interval() 함수는 기본적으로 영원히 지속되기 때문에 폴링 용도로 많이 사용합니다.

```java
CommonUtils.exampleStart();
Observable<Long> source = Observable.interval(0,100L, TimeUnit.MILLISECONDS)
  .map(data -> (data + 1) * 100)
  .take(5);
source.subscribe(Log::it);
CommonUtils.sleep(1000);
CommonUtils.exampleComplete();
```

Observable인 source변수는 100ms 간격으로 0부터 데이터를 발행한 후 map 함수를 호출하여 입력값에 1을 더하고 100을 곱합니다. 닫라서 100,200,300... 의 데이터를 발행합니다. take() 함수는 최초의 n개 데이터만 반영하기 때문에 위 코드의 실행 결과는 100~500까지만 나오게 됩니다.

> interval() 함수 자체는 간단합니다 :-)

CommonUtils.exampleStart() 는 시작 시간을 표시하는 유틸리티 메서드 입니다. rxJava는 비동기 프로그래밍이기에시간에 대한 이해가 중요하고 각 시작 시간을 기준으로 각 함수의 실행 시간을 측정할 수 있게 됩니다.

CommonUtils.sleep(1000) 은 단순히 thread.sleep() 을 호출합니다. sleep()을 호출하는 이유는 메인스레드가 아닌 별도의 스레드에서 동작하기 때문에 sleep()을 호출하지 않을 경우 main 스레드에서 할 일이 없기 때문에 프로그램을 바로 종료하게 됩니다.

```java
public static void it(Object obj) {
  long time = System.currentTimeMillis() - CommonUtils.startTime;
  System.out.println(getThreadName() + " | " + time + " | " + "value = " + obj);
}
```

유틸리티 클래스 Log는 CommonUtils 클래스와 함께 활용하면 로그를 출력할 때 실행되는 스레드의 이름과 실행시간을 표시할 수 있습니다. 그 중 it() 메서드는 information time 으로시간정보를 함께 출력해줍니다.

따라서 위의 함수 실행 결과는 다음과 같게 됩니다

```
RxComputationThreadPool-1 | 216 | value = 100
RxComputationThreadPool-1 | 317 | value = 200
RxComputationThreadPool-1 | 413 | value = 300
RxComputationThreadPool-1 | 516 | value = 400
RxComputationThreadPool-1 | 616 | value = 500
```

### 2.timer() 함수

timer() 함수는 interval()함수와 유사하지만 한번만 실행하는 함수입니다.

<img src="http://reactivex.io/documentation/operators/images/timer.c.png" alt="Timer" style="zoom:67%;" />

timer 함수의 원형은 interval()함수와 전반적으로 비슷하며, 현재스레드가 아닌 계산스케쥴러에서 실행하기 때문에 단독으로 사용하게 되는 경우 CommonUtils.sleep() 함수의 호출이 없으면 그냥 종료하게 됩니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.COMPUTATION)
public static Observable<Long> timer(long delay, TimeUnit unit)
```

### 3. range() 함수

range() 함수는 주어진 값 n부터 m개의 Integer 객체를 발행합니다. 앞선 interval()함수와 timer()함수는 Long를 발행했지만 range()하뭇는 Integer 객체를 발행하는 것이 다릅니다.

<img src="http://reactivex.io/documentation/operators/images/range.c.png" alt="Range" style="zoom:67%;" />

range() 함수의 원형을 보면 앞선 함수들과는 다르게 스케쥴러에서 실행되지 않아 현재 스레드에서 동작합니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.NONE)
public static Observable<Integer> range(final int start, final int count)
```

또한 range()함수는 다음과 같이 반복문을 대체할 수 있습니다.

```java
Observable<Integer> source = Observable.range(1, 10)
	.filter(number -> number % 2 == 0);
source.subscribe(Log::i);
```

### 4. intervalRange() 함수

intervalRange() 함수는 interval() 함수와 range() 함수를 혼합해 놓은 것으로 interval()함수처럼 무한히 데이터 흐름을 발행하지는 않습니다.

intervalRange() 함수의 원형을 보면 두 함수를 혼합하여 사용했기 때문에 계산스케줄러에서 실행이 됩니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.COMPUTATION)
public static Observable<Long> intervalRange(long start, long count, long initialDelay, long period, TimeUnit unit)
```

intervalRange() 함수의 예제는 다음과 같습니다.

```java
public void printNumbers() {
  Observable<Long> source = Observable.intervalRange(
    1,											//start
    5, 											//count
    100L ,									//initialDelay
    100L, 									//period
    TimeUnit.MILLISECONDS); //unit
  source.subscribe(Log::i);
  CommonUtils.sleep(1000);
  CommonUtils.exampleComplete();
}

```

인자가 5개나 되는 intervalRange() 함수와 interval(), map(),take() 함수를 조합하여 만들어낸 두가지 코드가 있습니다.

interval() 함수로 intervalRange() 함수 만든다면 다음과 같습니다.

```java
public void makeWithInterval() {
  Observable<Long> source = Observable.interval(100L, TimeUnit.MILLISECONDS)
    .map(val -> val + 1)
    .take(5);
  source.subscribe(Log::i);
  CommonUtils.sleep(1000);
  CommonUtils.exampleComplete();
}
```

인자가 5개나 되는 intervalRange() 함수와 interval(), map(),take() 함수를 조합하여 만들어낸 두가지 코드가 있습니다. 함수를 조합하여 인자가 적을 수록 의미가 더 뚜렷하게 와닿는 것 같이 조합을 잘 하는 것이 중요해보입니다.

### 5. defer() 함수

defer()함수는 timer()함수와 비슷하지만 데이터 흐름 생성을 구독자가 subscribe() 함수를 호출할 때까지 미룰 수 있습니다.
<img src="http://reactivex.io/documentation/operators/images/defer.c.png" alt="Defer" style="zoom:67%;" />

Observeble의 생성이 구독할 때까지 미뤄지기 때문에 최신 데이터를 얻을 수 있습니다.

스케줄러 NONE 이기 때문에 메인스레드에서 동작하며 인자로는 **Callable<Observable<T>>**를 받습니다. **Callable 객체**이기 때문에 subscribe() 함수를 호출할 때까지 call 메서드의 호출을 미룰 수 있게 됩니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.NONE)
public static <T> Observable<T> defer(Callable<? extends ObservableSource<? extends T>> supplier)
```

### 6.repeat() 함수

단순히 반복실행을 합니다. 주로 서버가 잘 살아있는지 확인(ping, heart beat 라고 한다) 하는 코드에 사용하게 된다.

<img src="http://reactivex.io/documentation/operators/images/repeat.c.png" alt="Repeat" style="zoom:67%;" />

```java
String[] balls = {"1", "3", "5"};
Observable<String> source = Observable.fromArray(balls)
  .repeat(3);

source.doOnComplete(() -> Log.d("onComplete"))
  .subscribe(Log::i);
CommonUtils.exampleComplete();
```

repeat() 함수는 인자를 입력하지 않으면 영원히 반복실행합니다. 따라서 repeat(N) 함수를 활용해 N번만큼 실행하게 하는 코드입니다.
그리고 doOnComplete() 함수를 호출하여 onComplete 이벤트가 발생할 때 로그를 출력합니다

실행 결과

```
main | value = 1
main | value = 3
main | value = 5
main | value = 1
main | value = 3
main | value = 5
main | value = 1
main | value = 3
main | value = 5
main | debug = onComplete
```

- 서버에 heart beat(ping) 하는 코드 예시
  지속적인 통신을 해야 하는 서버의 경우 일정 시간 안에 heart beat 패킷을 보내지 않으면 서버는 클라이언트와의 연결이 종료된 것 으로 판단하고 연결을 해제하는데 이럴 경우에 repeat()함수를 활용해 간단히 구현이 가합니다.

```java
CommonUtils.exampleStart();
String serverUrl = "https://api.github.com/zen";

Observable.timer(2, TimeUnit.SECONDS) 		//2초 간격으로 서버에 ping 날리기
  .map(val -> serverUrl)
  .map(OkHttpHelper::get)
  .repeat()
  .subscribe(res -> Log.it("Ping Result : " + res));
CommonUtils.sleep(10000);
CommonUtils.exampleComplete();
```

timer() 함수를 사용해 2초마다 반복 실행되도록 하였고 이를 위해 원래 timer() 함수에서 설정하는 0L 값을 serverUrl으로 바꿧씁니다. 그리고 OkHttp get 메서드를 실행해 HTTP GET명령을 호출하고 결과를 리턴합니다

실행결과

```
RxComputationThreadPool-1 | 2842 | value = Ping Result : Approachable is better than simple.
RxComputationThreadPool-2 | 4914 | value = Ping Result : Approachable is better than simple.
RxComputationThreadPool-3 | 6945 | value = Ping Result : Approachable is better than simple.
RxComputationThreadPool-4 | 8977 | value = Ping Result : Approachable is better than simple.
```

원래 timer() 함수는 한번 실행하고 종료되지만 repeat() 함수로 인해 동작이 한 번 끝난 다음에 다시 구독하여 반복 실행되게 됩니다. 그리고 다시 구독할 때마다 동작하는 스레드의 번호가 달라집니다.

> 만약 동작하는 스레드를 동일하게 맞추려면 timer()와 repeat() 함수를 빼고 interval() 함수를 대신 넣어 호출하면 됩니다.
