---
title: Reactive - 결합 연산자
date: "2021-01-20"
tags: ["rx", "rxJava", "yuchocopie", "Combine Operator"]
description: "Combine Operator zip(), combineLatest(), Merge(), concat() "
cover: "./ic_cover.png"
---

# Reactive 결합 연산자

리액티브 연산자

- 생성연산자: Observable로 데이터 흐름을 만든다

- 변환연산자, 필터 연산자: 데이터 흐름을 원하는 방식으로 변형

- 결합연산자: 1개의 Observer이 아니라 여러 개의 Observable을 조합할 수 있도록 해준다

| 연산자 종류      | 연산자 함수                                                                                   |
| :--------------- | :-------------------------------------------------------------------------------------------- |
| 생성 연산자      | just(), fromXXX(), create(), interval(), range(), timer(), intervalRange(), defer(), repeat() |
| 변환 연산자      | map(), flatMap(), concatMap(), switchMap), groupBy(), scan(), buffer(), window()              |
| 필터 연산자      | filter(), take(), skip(), distinct()                                                          |
| **결합 연산자**  | zip(), combineLatest(), Merge(), concat()                                                     |
| 조건 연산자      | amb(), takeUntil(), skipUntil(), all()                                                        |
| 에러 처리 연산자 | onErrorReturn(), onErrorResumeNext(), retry(), retryUntil()                                   |
| 기타 연산자      | subscribe(), subscribeOn(), observeOn(), reduce(), count()                                    |

# 결합 연산자

결합연산자는 다수의 Observeble을 하나로 합하는 방법을 제공합니다. flatMap() 함수나 groupBy() 함수는 1개의 Observeble을 확장해주는 반면 결합연산자는 여러개의 Observeble을 내가 원하는 Observeble로 결합해줍니다.

- zip() 함수 : 입력 Observeble에서 데이터를 모두 새로발행했을 때 그것을 합해줍니다

- combineLatest() 함수: 처음에 각 Observeble에서 데이터를 발행한 후에는 어디에서 값을 발행하던 최신 값으로 갱신합니다.
- merge() 함수: 최신 데이터 여부와 상관없이 각 Observeble에서 발행하는 데이터를 그대로 출력합니다.
- concat() 함수: 입력된 Observeble을Observeble 단위로 붙여줍니다.

### 1. zip() 함수

zip() 함수는 각각의 Observeble을 모두 활용해 2개 혹은 그 이상의 Observeble을 결합합니다.

예를 들어 A,B 두 개의 Observeble을 결합한다면 2개의 Observeble에서 모두 데이터를 발행해야 결합할 수 있고 그 전까지는 발행을 기다립니다.
[마블다이어그램](http://reactivex.io/documentation/operators/zip.html)은 다음과 같습니다

<img src="./images/zip.i.png" alt="zipWith" style="zoom:67%;" />

zip() 함수의 원형은 아래와 같습니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.NONE)
public static <T1, T2, R> Observable<R> zip(
ObservableSource<? extends T1> source1, ObservableSource<? extends T2> source2,
BiFunction<? super T1, ? super T2, ? extends R> zipper)
```

zip() 함수의 원형을 보면 첫 번째 Observeble은 source1 에 넣고 두 번째 Observeble은 source2에 넣은 후 그것을 결합해줄 zipper 변수에 원하는 함수를 넣으면 된다는 뜻입니다.
zip() 함수는 최대 9개의 Observeble을 결합할 수 있지만 보통 2개 혹은 3개면 충분합니다.

사용 예시

```java
Observable<Integer> source = Observable.zip(
			Observable.just(100, 200, 300),
			Observable.just(10, 20, 30),
			Observable.just(1, 2, 3),
			(a, b, c) -> a + b + c );
source.subscribe(Log::i);
```

결과

```
main | value = 111
main | value = 222
main | value = 333
```

전기요금 사용 예제를 통해 zip 을 응용해보겠습니다~.

| **기본요금(원/호)**  |           | **전력량 요금(원/kWh)** |           |
| -------------------- | --------- | ----------------------- | --------- |
| **200kWh 이하 사용** | **910**   | **처음 200kWh 까지**    | **93.3**  |
| **201~400kWh 사용**  | **1600**  | **다음 200kWh 까지**    | **187.9** |
| **400kWh 초과 사용** | **7,300** | **400kWh 초과**         | **280.6** |

```java
private int index = 0; //FIXME don't use it

String[] data = {
  "100",  //910 + 93.3 * 100 = 10,240원
  "300",  //1600 + 93.3 * 200 + 187.9 * 100 = 39,050원
  "800",  //7300 + 93.3 * 200 + 187.9 * 200 + 280.65 * 200 = 175,800원
};

Observable<Integer> basePrice = Observable.fromArray(data)
  .map(Integer::parseInt)
  .map(val -> {
    if (val <= 200) return 910;
    if (val <= 400) return 1600;
    return 7300;
  });

Observable<Integer> usagePrice = Observable.fromArray(data)
  .map(Integer::parseInt)
  .map(val -> {
    double series1 = min(200, val) * 93.3;
    double series2 = min(200, max(val-200, 0)) * 187.9;
    double series3 = max(0, max(val-400, 0)) * 280.65;
    return (int)(series1 + series2 + series3);
  });

Observable<Integer> source = Observable.zip(
  basePrice,
  usagePrice,
  (v1, v2) -> v1 + v2);

//print the result
source.map(val -> new DecimalFormat("#,###").format(val))
  .subscribe(val -> {
    StringBuilder sb = new StringBuilder();
    sb.append("Usage: " + data[index] + " kWh => ");
    sb.append("Price: " + val + "원");
    Log.i(sb.toString());

    index++; //FIXME side effect!!!!
  });
```

기본요금은 basePrice Observable로, 전력량 요금은 usagePrice Observable로 분리합니다.
basePrice와 usagePrice을 각각 구현해 map함수를 사용하면 어려운 것이 아니지만 2개의 Observable로 나누고 그것을 zip() 함수로 결합하는 것을 생각하는 것이 중요합니다.

전기 요금을 출력하기 위해서는 천원 단위로 콤마를 붙여줘야 하는데 source 변수에 map() 함수를 호출하여 간단히 처리했습니다. 이때 source 변수를 선언할 때가 아니라 마지막 subscribe() 함수 호출 전에 DecimalFormat.format() 메서드를 인자로 넣은 후 map() 함수를 호출해서 데이터를 발행하는 곳과 그것을 활용하여 결과를 표시하는 로직을 분리했음을 눈여겨 보자.

전력사용량 100,300,800 을 출력하기 위해 멤버변수 index를 참조한다. 이는 부수효과 발생할 수 있기 때문에 함수형 프로그래밍의 기본원칙에 어긋납니다. 이를 해결하기위해 zip을 활용해보겠습니다.

크게 세가지 힌트가 주어집니다.

1. data를 추가로 넘겨주는 방법을 고민합니다
2. zip() 함수는 2개 뿐만 아니라 3개의 Observable 도 결합할 수 있다
3. 새로운 클래스를 사용하는 것보다 **아파치 커먼즈의 Pair클랫스**를 사용한다

바뀐 코드

```java
String[] data = {
  "100",  //910 + 93.3 * 100 = 10,240원
  "300",  //1600 + 93.3 * 200 + 187.9 * 100 = 39,050원
  "800",  //7300 + 93.3 * 200 + 187.9 * 200 + 280.65 * 200 = 175,800원
};

Observable<Integer> basePrice = Observable.fromArray(data)
  .map(Integer::parseInt)
  .map(val -> {
    if (val <= 200) return 910;
    if (val <= 400) return 1600;
    return 7300;
  });

Observable<Integer> usagePrice = Observable.fromArray(data)
  .map(Integer::parseInt)
  .map(val -> {
    double series1 = min(200, val) * 93.3;
    double series2 = min(200, max(val-200, 0)) * 187.9;
    double series3 = max(0, max(val-400, 0)) * 280.65;
    return (int)(series1 + series2 + series3);
  });

Observable<Pair<String, Integer>> source = Observable.zip(
  basePrice,
  usagePrice,
  Observable.fromArray(data),
  (v1, v2, i) -> Pair.of(i, v1+v2));

//print the result
source.map(val -> Pair.of(val.getLeft(),
                          new DecimalFormat("#,###").format(val.getValue())))
  .subscribe(val -> {
    StringBuilder sb = new StringBuilder();
    sb.append("Usage: " + val.getLeft() + " kWh => ");
    sb.append("Price: " + val.getRight() + "원");
    Log.i(sb.toString());
  });
CommonUtils.exampleComplete();
```

함수형 프로그래밍에서는 임시 자료구조를 활용할 때 클래스를 만드는 것 보다 Pair같은 범용적으로 활용할 수 있는 자료구조 사용을 선호합니다. 결론을 출력할 때는 Pair 객체의 getLeft()와 getRight 메서드를 호출합니다.

- zipWith()

  ```java
  Observable<Integer> source = Observable.zip(
    Observable.just(100, 200, 300),
    Observable.just(10, 20, 30),
    (a, b) -> a + b)
    .zipWith(Observable.just(1, 2, 3), (ab, c) -> ab + c);
  source.subscribe(Log::i);
  ```

  zipWith() 함수는 zip()함수와 동일하지만 Observable을 다양한 함수와 조합하면서 틈틈이 호출할 수 있는 장점이 있습니다.

  실행결과

  ```
  main | value = 111
  main | value = 222
  main | value = 333
  ```

### 2. combineLatest() 함수

combineLatest() 함수는 2개 이상의 Observable을 기반으로 Observable 각각의 값이 변경되었을 때 갱신해주는 함수입니다. 마지막 인자로 combine이 들어가는데 그것이 각 Observable을 결합하여 어떤 결과를 만들어주는 역할을 합니다.

[마블다이어그램](http://reactivex.io/documentation/operators/combinelatest.html) 은 아래와 같습니다.

<img src="./images/combineLatest.png" alt="combineLatest" style="zoom:67%;" />

첫 번째 Observable이나 두 번째 Observable에서만 흐름이 있을 경우 구독자에게 어떤 데이터도 발행하지 않습니다. 하지만 두 Observable 모두 값을 발행하면 그 때 결과값이 나오며 둘 중에 어떤 것이 갱신되던지 최신 결과값을 보여줍니다.(zip 과의 차별점)
함수원형은 아래와 같습니다.

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.NONE)
public static <T1, T2, R> Observable<R> combineLatest(
ObservableSource<? extends T1> source1, ObservableSource<? extends T2> source2,
BiFunction<? super T1, ? super T2, ? extends R> combiner)
```

zip() 함수처럼 결합하고자 하는 첫 번째와 두 번째 Observable을 넣고 마지막으로 그것을 결합하는 combiner() 함수를 넣어주면 됩니다. 입력할 수 있는 Observable 인자 개수는 최대 9개 입니다.

### 3. merge() 함수

merge() 함수는 Observable의 순서와 모든 Observable의 데이터를 발행하는지 등에 관여하지 않고 어느 것이든 업스트림엣서 먼저 입력되는 데이터를 그대로 발행합니다.

[merge() 마블 다이그램](http://reactivex.io/documentation/operators/merge.html)
<img src="./images/merge.png" alt="병합" style="zoom:67%;" />

merge() 함수는 전달 된 개별 Observable 중 하나 `merge`가 `onError`알림 과 함께 종료되는 경우 `merge`자체 생성 된 Observable 이 `onError`알림 과 함께 즉시 종료됩니다 .

오류가 발생하기 전에 오류가없는 나머지 Observable의 결과를 계속 내보내는 병합을 선호하는 경우 `mergeDelayError`대신 사용해야합니다.

<img src="./images/mergeDelayError.C.png" alt="MergeDelayError" style="zoom:67%;" />

mergeDelayError는 merge와 매우 유사하게 작동합니다. 하지만 병합되는 Observable 중 하나가 onError 알림으로 종료되는 경우에는 다르게 동작합니다. merge 함수일 경우 error가 발생하면 merge 된 Observable이 즉시 onError 알림을 발행하고 종료됩니다. 반면 mergeDelayError는 오류가 발생하지 않는 다른 Observable에게 항목 방출을 완료 할 기회를 병합 할 때까지 오류보고를 보류하고, 항목 자체를 방출하고 난 다음 종료됩니다.
병합 된 다른 모든 Observable이 완료되면 onError 알림니다. 병합 된 Observable 중 두 개 이상에서 오류가 발생할 수 있으므로 mergeDelayError는 onError 알림에서 여러 오류에 대한 정보를 전달할 수 있습니다 (관찰자의 onError 메서드를 두 번 이상 호출하지 않음). 따라서 이러한 오류의 특성을 알고 싶다면 관찰자의 onError 메서드를 작성하여 CompositeException 클래스의 매개 변수를 허용해야합니다.
mergeDelayError에는 Iterable 또는 Observable 배열을 전달할 수는 없지만 Observable을 내보내거나 1 ~ 9 개의 개별 Observable을 매개 변수로 내보내는 Observable을 전달할 수 있습니다. merge에 대한 것이므로 mergeDelayError의 인스턴스 메소드 버전이 없습니다.

### 4. concat() 함수

concat() 은 2개 이상의 Observable을 이어붙여주는 함수입니다. 첫번째 Observable에 onComplete 이벤트가 발생해야 두 번째 Observable을 구독합니다.

[concat 마블 다이어그램](http://reactivex.io/documentation/operators/concat.html)
<img src="./images/concat.png" alt="concat" style="zoom:67%;" />

concat 함수 원형

```java
@CheckReturnValue
@SchedulerSupport(SchedulerSupport.NONE)
public static <T> Observable<T> concat(ObservableSource<? extends T> source1, ObservableSource<? extends T> source2)
```

reference

http://reactivex.io
