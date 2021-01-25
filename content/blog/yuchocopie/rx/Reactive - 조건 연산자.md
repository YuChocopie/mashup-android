---
title: Reactive - 조건 연산자
date: "2021-01-20"
tags: ["rx", "rxJava", "yuchocopie", "Conditional Operator"]
description: "Conditional Operator amb(), takeUntil(), skipUntil(), all()"
cover: "./ic_cover.png"
---

# Reactive 조건 연산자

리액티브 연산자

- 생성연산자: Observable로 데이터 흐름을 만든다

- 변환연산자, 필터 연산자: 데이터 흐름을 원하는 방식으로 변형

- 결합연산자: 1개의 Observer이 아니라 여러 개의 Observable을 조합할 수 있도록 해준다

| 연산자 종류      | 연산자 함수                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------- |
| 생성 연산자      | just(), fromXXX(), create(), interval(), range(), timer(), intervalRange(), defer(), repeat() |
| 변환 연산자      | map(), flatMap(), concatMap(), switchMap), groupBy(), scan(), buffer(), window()              |
| 필터 연산자      | filter(), take(), skip(), distinct()                                                          |
| 결합 연산자      | zip(), combineLatest(), Merge(), concat()                                                     |
| **조건 연산자**  | amb(), takeUntil(), skipUntil(), all()                                                        |
| 에러 처리 연산자 | onErrorReturn(), onErrorResumeNext(), retry(), retryUntil()                                   |
| 기타 연산자      | subscribe(), subscribeOn(), observeOn(), reduce(), count()                                    |

# 조건 연산자

조건 연산자는 Observeble의 흐름을 제어하는 역할을 합니다. 필터 연산자가 발행된 값을 채택하느냐 기각하느냐 여부에 초점을 맞춘다면, 조건연산자는 지금까지의 흐름을 어떻게 제어할 것인지에 초점을 맞춤니다.

- **amb() 함수 ** 둘중 어느것이든 먼저나오는 Observable을 채택합니다.
- **takeUntil(other) 함수 ** other Observable에서 데이터가 발행되기 전까지만 현재 Observable을 채택합니다.
- **skipUntil(other) 함수** takeUntil(other) 함수와는 반대로 other Observable에서 데이터가 발행될 동안 현재 Observable에서 발행하는 값을 무시합니다.

- **all() 함수 ** Observable에 입력되는 값이 모두 특정 조건에 맞을때만 true를 발행합니다. 만약 조건이 맞지않는다면 바로 false를 발행합니다

### 1. amb() 함수

여러 개의 Observable 중에서 가장 먼저 데이터를 발행하는 1개의 Observable를 선택합니다. 이후 나머지 Observable에서 발행하는 데이터는 모두 무시합니다.

[amb 마블 다이어그램](http://reactivex.io/documentation/operators/amb.html)

<img src="http://reactivex.io/documentation/operators/images/amb.png" alt="amb" style="zoom:67%;" />

### 2. takeUntil(other) 함수

takeUntil() 함수는 take() 함수에 조건을 설정할 수 있습니다.
인자로 받은 Observable에서 어떤 값을 발행하면 현재 Observable의 데이터 발행을 중단하고 즉시 완료(onComplete)합니다. 즉 take() 함수처럼 일정 개수만 값을 발행하되 완료 기준을 다른 Observable에서 값을 발행하는지로 판단하는 것입니다.

[TakeWhile 마블 다이어그램](http://reactivex.io/documentation/operators/takewhile.html)

<img src="http://reactivex.io/documentation/operators/images/takeWhile.c.png" alt="TakeWhile" style="zoom:67%;" />

예시코드

```java
String[] data = {"1", "2", "3", "4", "5", "6"};

Observable<String> source = Observable.fromArray(data)
    .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS),
    (val, notUsed) -> val)
    .takeUntil(Observable.timer(500L, TimeUnit.MILLISECONDS));

source.subscribe(Log::i);
CommonUtils.sleep(1000);
```

결과

```
RxComputationThreadPool-2 | value = 1
RxComputationThreadPool-2 | value = 2
RxComputationThreadPool-2 | value = 3
RxComputationThreadPool-2 | value = 4
```

### 3.skipUntil(other) 함수

skipUntil(other) 함수는 takeUntil() 함수와 정반대의 함수입니다.

[skipUntil마블다이어그램](http://reactivex.io/documentation/operators/skipuntil.html)

<img src="http://reactivex.io/documentation/operators/images/skipUntil.png" alt="skipUntil" style="zoom:67%;" />

takeUntil() 함수와는 다르게 other Observable에서 화살표가 나올때 까지는 값을 발행하지 않고 건너뛰다가 other Observable에서 값을 발행하는 순간부터 원래 Observable에서 값을 정상적으로 발행하기 시작합니다.

### 4. all() 함수

all() 함수는 단순합니다. **주어진 조건에 100% 맞을 때만 true값을 발행하고 조건에 맞지 않는 데이터가 발행되면 바로 false값을 발행합니다.**

[all 마블다이어그램](http://reactivex.io/documentation/operators/all.html)

<img src="http://reactivex.io/documentation/operators/images/all.png" alt="all" style="zoom:67%;" />

> # 기타 연산자
>
> 1.  [delay() 함수](http://reactivex.io/documentation/operators/delay.html)
>     유틸리티 연산자로 보조 역할을 한다
>     인자로 전달받는 time과 시간 단위 (ms,m 등) 만큼 입력받은 Observable의 데이터 발행을 지연시켜주는 역할을 한다.
>
>    <img src="http://reactivex.io/documentation/operators/images/delay.png" alt="delay" style="zoom:67%;" />
>
> 2. [TimeInterval() 함수](http://reactivex.io/documentation/operators/timeinterval.html)
>    어떤 값을 발행했을 때 이전 값을 발행한 이후 시간이 얼마나 흘렀는지 알려준다.
>    <img src="http://reactivex.io/documentation/operators/images/timeInterval.c.png" alt="TimeInterval" style="zoom:67%;" />
>
>    예시코드
>
>    ```java
>    String[] data = {"RED", "GREEN", "ORANGE"};
>
>    CommonUtils.exampleStart();
>    Observable<Timed<String>> source = Observable.fromArray(data)
>      .delay(item -> {
>        CommonUtils.doSomething();
>        return Observable.just(item);
>      })
>      .timeInterval();
>
>    source.subscribe(Log::it);
>    ```
>
>    결과
>
>    ```
>    main | 165 | value = Timed[time=14, unit=MILLISECONDS, value=RED]
>    main | 264 | value = Timed[time=99, unit=MILLISECONDS, value=GREEN]
>    main | 306 | value = Timed[time=42, unit=MILLISECONDS, value=ORANGE]
>    ```
