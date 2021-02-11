---
title: "Reactive - 디버그와 예외 처리"
date: "2021-02-11"
tags: ["rx", "rxjava", "mash-up", "minuk", "error", "debug"]
description: "RxJava 프로그래밍 디버그와 예외 처리"
cover: "./rx_cover.png"
---

# 7장. 디버깅과 예외처리

지금까지 배운 Observable와 각종 리액티브 연산자를 활용하면 무엇이든 만들 수 있다고 한다고 해요. 

하지만 **상용 서비스처럼 간단하지 않고 복잡한 코드 로직들은** 예상하지 못한 각종 버그와 오류가 발생할 가능성이 많아서 디버깅과 예외처리를 통해 보다 안정성이 있는 코드를 구현해야 합니다. 때문에 `디버깅과 예외 처리`는 필수로 적용해야 합니다.<br></br>

## 디버깅

"함수형 프로그래밍은 함수의 부수효과를 없도록 하는 것이 원칙이지만 doOnXXX() 계열 함수는 **오히려 부수 효과를 일으켜서** 내가 작성하는 코드가 문제 없는지 알아볼 수 있게 합니다." <br></br>

😒❓

doOnXXX() 계열 함수는 오히려 **부수 효과**를 발생?? 

- Sample Code

    Person class

    ```java
    static class Person {
            int age;
            String name;

            public Person(int age, String name) {
                this.age = age;
                this.name = name;
            }

            @Override
            public String toString() {
                return "Person{" +
                        "age=" + age +
                        ", name='" + name + '\'' +
                        '}';
            }
        }

    ```

    **예제 코드**

    ```java
    Person[] people = new Person[] {
                    new Person(1, "minuk"),
                    new Person(2, "minsu")
            };

    Observable.fromArray(people)
                    .doOnNext(data -> {
                        data.age = 5;
                    }).subscribe(Log::i);
    ```

    **출력**

    ```java
    main | value = Person{age=5, name='minuk'}
    main | value = Person{age=5, name='minsu'}
    ```

    doOnXXX 함수에서 전달되는 인자들은 다음 데이터 흐름에 전달이 될 객체 그 자체가 오기 때문에

    부수효과를 발생하는 것이다.

### 7.1.1 doOnNext(), doOnComplete(), doOnError()

`doOnNext()`, `doOnComplete()`, `doOnError()`라는 세 가지 함수는 Observable의 알림 이벤트에 해당합니다. <br></br>

Observable의 알림 이벤트

- **onNext**
- **onComplete**
- **onError**

<br></br>

**예제 코드**

```java
Integer[] divider = {10, 5, 0};
        Observable.fromArray(divider) 
                .map(div -> 1000 / div)
                .doOnNext(data -> Log.d("onNext()", data))
                .doOnComplete(() -> Log.d("onComplete()"))
                .doOnError(e -> Log.d("onError()", e.getMessage()))
                .subscribe(Log::i);
```

**출력**

```java
main | onNext() | debug = 100
main | value = 100
main | onNext() | debug = 200
main | value = 200
main | onError() | debug = / by zero

io.reactivex.exceptions.OnErrorNotImplementedException: The exception was not handled due to missing onError handler in the subscribe() method call. Further reading: https://github.com/ReactiveX/RxJava/wiki/Error-Handling | java.lang.ArithmeticException: / by zero
	at io.reactivex.internal.functions.Functions$OnErrorMissingConsumer.accept(Functions.java:704)
	at io.reactivex.internal.functions.Functions$OnErrorMissingConsumer.accept(Functions.java:701)
```

<br></br>

숫자를 0으로 나누게 되면 시스템에서는 에러가 발생하여 실행중인 프로그램이 종료되지만 `doOnError()` 함수로 **onError** 이벤트가 발생했을 때 에러 메세지인 `/by zero` 를 디버그 할 수 있다.<br></br>

onComplete() 이벤트는 Observable의 데이터 흐름이 모두 종료되기 전에 onError 이벤트가 발생해서 호출 되지 않는다.<br></br>

 

`OnErrorNotImplementedException` 의 이름으로 표준 에러 입출력 부분에 에러가 상세히 표시 되는데,

이름으로 짐작할 수 있듯이 이후에 나올 onError 예외 처리를 해주어야 한다라고 알려주고 있다.<br></br>

### 7.1.2 doOnEach() 함수

doOnEach() 함수는 `Next`, `onComplete`, `onError` 이벤트를 각각 처리하는 것이 아니라 **한번에 처리**할 수 있습니다.<br></br>

- Notification 객체는 아래처럼 발생한 이벤트의 종류를 알  수 있는 boolean 타입의 함수를 제공

**Notification <T> 객체**

```java
public final class Notification<T> {

    public boolean isOnComplete() {
        return value == null;
    }

    public boolean isOnError() {
        return NotificationLite.isError(value);
    }

    public boolean isOnNext() {
        Object o = value;
        return o != null && !NotificationLite.isError(o);
    }
}
```

**예제 코드**

```java
String[] data = {"ONE", "TWO", "THREE"};

Observable.fromArray(data)
          .doOnEach(noti -> {
             if (noti.isOnNext()) Log.d("onNext()", noti.getValue());
             if (noti.isOnComplete()) Log.d("onComplete()");
             if (noti.isOnError()) Log.d("onError", noti.getError().getMessage());
           }).subscribe(System.out::println);

or

//Observer 인터페이스로도 doOnEach 인자로 전달 가능

String[] data = {"ONE", "TWO", "THREE"};

        Observable.fromArray(data)
                .doOnEach(new Observer<String>() {
                    @Override
                    public void onSubscribe(@NonNull Disposable d) {
                        Log.d("onSubscribe()");
												//doOnEach()에서는 onSubscribe() 함수가 호출되지 않습니다.
                    }

                    @Override
                    public void onNext(@NonNull String s) {
                        Log.d("onNext()", s);
                    }

                    @Override
                    public void onError(@NonNull Throwable e) {
                        Log.d("onError", e.getMessage());
                    }

                    @Override
                    public void onComplete() {
                        Log.d("onComplete()");
                    }
                }).subscribe(System.out::println);
```

**출력**

```java
main | onNext() | debug = ONE
ONE
main | onNext() | debug = TWO
TWO
main | onNext() | debug = THREE
THREE
main | debug = onComplete()
```

<br></br>

### 7.1.3 doOnSubscribe(), doOnDispose() 함수

Observable의 알림 이벤트 중에는 `onSubscribe`와 `onDispose` 이벤트도 있습니다. 각각 Observable을 구독했을 때와 구독을 해지했을 때의 이벤트를 의미합니다.<br></br>

```java
public final Observable<T> doOnSubscribe(Consumer<? super Disposable> onSubscribe)
public final Observable<T> doOnDispose(Action onDispose)
```

- doOnSubscribe() 함수는 Observable을 구독했을 때  호출되며 함수의 인자는 구독의 결과인 `Disposable`객체
- doOnDisposable() 함수는 Observable의 구독을 해지했을 때 호출되며 함수의 인자는 `Action` 객체

<br></br>

- Action class

    단순 run() 함수를 가진 클래스

    ```java
    public interface Action {
        /**
         * Runs the action and optionally throws a checked exception.
         * @throws Exception if the implementation wishes to throw a checked exception
         */
        void run() throws Exception;
    }
    ```

**예제 코드**

```java
String[] orgs = {"1", "3", "5", "2", "6"};
        Observable<String> source = Observable.fromArray(orgs)
                .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a, b) -> a)
                .doOnSubscribe(disposable -> Log.d("onSubscribe()"))
                .doOnDispose(() -> Log.d("onDispose()"));

        Disposable d = source.subscribe(Log::i);

        Thread.sleep(200);

        d.dispose();

        Thread.sleep(300);
```

**출력**

```java
main | debug = onSubscribe()
RxComputationThreadPool-1 | value = 1
RxComputationThreadPool-1 | value = 3
main | debug = onDispose()
```

zipWith()함수를 활용하여 interval() 함수와 합성했기 때문에 main 스레드가 아니라 **계산 스케줄러**에서 동작합니다. 따라서 프로세스가 바로 종료되지 않게 Main Thread의 sleep 함수로 지연을 주어야 합니다.<br></br>

interval() 함수로 인해 100ms 단위로 데이터가 발행이 되는데 mainThread에서 200ms가 흐른 후 `dispose()` 를 호출하여 구독자는 데이터가 2개만 받게 됩니다.<br></br>

😒❓

doOnDisposable() 함수는 Observable의 구독을 해지했을 때 호출되며 함수의 인자는 `Action` 객체입니다.

스레드 다수에서 Observable을 참조할 수 있기 때문에 Action 객체는 **스레드 안전**하게 동작해야 한다.

<br></br>

- Sample Code

    ```java
    String[] orgs = {"1", "3", "5", "2", "6"};
            Observable<String> source = Observable.fromArray(orgs)
                    .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a, b) -> a)
                    .doOnSubscribe(disposable -> Log.d("onSubscribe()"))
                    .doOnDispose(() -> Log.d("onDispose()"));

            Disposable d1 = source.subscribe(Log::i);

            new Thread() {
                @Override
                public void run() {
                    super.run();
                    try {
                        Disposable d2 = source.subscribeOn(Schedulers.computation()).subscribe(Log::i);
                        Thread.sleep(200);
                        d2.dispose();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }.run();

            Thread.sleep(200);

            d1.dispose();

            Thread.sleep(10000);

        }
    ```

        

          **출력**

    ```java
    main | debug = onSubscribe()
    RxComputationThreadPool-2 | debug = onSubscribe()
    RxComputationThreadPool-1 | value = 1
    RxComputationThreadPool-3 | value = 1
    RxComputationThreadPool-3 | value = 3
    RxComputationThreadPool-1 | value = 3
    main | debug = onDispose()
    RxComputationThreadPool-1 | value = 5
    RxComputationThreadPool-1 | value = 2
    main | debug = onDispose()
    ```

    MainThread가 아닌 외부 쓰레드에서 구독하고 해제를 했는데도 `doOnDisposable()` 호출되는 쓰레드는 mian이다. 어떻게하면 다중 쓰레드에서 접근할 수 있을까?

<br></br>

### 7.1.4 doOnLifeCycle()

**doOnSubscribe**()와 **doOnDisposable**() 함수를 각각 호출하지 않고 한꺼번에 호출하는 함수인 `doOnLifecycle()`이 있습니다. **doOnLifecycle 함수**는 doOnSubscribe 함수 인자와 doOnDisposable의 인자를 한번에 인자로 받는다.<br></br>

```java
String[] orgs = {"1", "3", "5", "2", "6"};
Observable<String> source = Observable.fromArray(orgs)
           .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a, b) -> a)
           .doOnLifecycle(
             d -> Log.d("onSubscribe()"), () -> Log.d("onDispose()"));

Disposable d = source.subscribe(Log::i);

Thread.sleep(200);

d.dispose();

Thread.sleep(300);
```

출력 결과는 **7.1.3의 출력**과 동일합니다! <br></br>

### 7.1.5 doOnTerminate()와 doFinally()

`doOnTerminate()`는 Observable이 끝나는 조건이 **onComplete** 혹은 **onError** 이벤트가 발생했을 때 실행하는 함수입니다. 정확하게는 onComplete() **혹은** onError **이벤트 발생 직전에 호출**합니다.<br></br>

`doFinally()` 는 **onError, onComplete** 혹은 **onDispose** 이벤트 발생 시에 호출됩니다.

**예제 코드**

```java
String[] orgs = {"1", "3", "5"};
Observable<String> source = Observable.fromArray(orgs);

source.doOnTerminate(() -> Log.d("onTerminate()"))
            .doFinally(() -> Log.d("onFinally()"))
            .doOnComplete(() -> Log.d("onComplete()"))
            .doOnError(e -> Log.d("onError()", e.getMessage()))
            .subscribe(Log::i);
```

**출력**

```java
main | value = 1
main | value = 3
main | value = 5
main | debug = onTerminate()
main | debug = onComplete()
main | debug = onFinally()
```

<br></br>

## 7.2 예외 처리

원래 자바에서는 정상적인 실행 코드와 예외 처리 코드를 분리하기 위해 **try-catch 문을** 제공합니다.

try-catch문을 Rx에 적용할 수 있을까요?<br></br>

```java
Observable<String> source = Observable.create(
                (ObservableEmitter<String> emitter) -> {
                    emitter.onNext("1");
                    emitter.onError(new Exception("Some Error"));
                    emitter.onNext("3");
                    emitter.onComplete();
                }
        );

 try {
		// 정상적인 실행 코드
    source.subscribe(Log::i);
} catch (Exception e) {
		//예외 처리 코드
   System.out.println(e.getMessage());
}
```

subscribe 함수 오버로딩 중 onNext 이벤트 인자만 정의할 경우 RxJava 로직 중 에러가 발생하면 오류를 내뿜으며 프로세스 종료 된다. <br></br>

결과를 보면 try catch문으로 예외 처리할 수가 없다.

```java
main | value = 1

io.reactivex.exceptions.OnErrorNotImplementedException: The exception...
```

7.1의 코드에서 발생한 에러와 동일합니다. `OnErrorNotImplementedException`

<br></br>

**Observable.subscribe()**

```java
@CheckReturnValue
    @SchedulerSupport(SchedulerSupport.NONE)
    public final Disposable subscribe(Consumer<? super T> onNext) {
        return subscribe(onNext, Functions.ON_ERROR_MISSING, Functions.EMPTY_ACTION, Functions.emptyConsumer());
    }
```

<br></br>

**ON_ERROR_MISSING**

```java

public static final Consumer<Throwable> ON_ERROR_MISSING = new OnErrorMissingConsumer();

static final class OnErrorMissingConsumer implements Consumer<Throwable> {
        @Override
        public void accept(Throwable error) {
            RxJavaPlugins.onError(new OnErrorNotImplementedException(error));
        }
    }
```

`new OnErrorNotImplementedException(error)` 코드를 통해 

단지 `OnErrorNotImplementedException` 예외를 던지라고 알려주는 역할을 합니다.<br></br>

**LamdaObserver.onError**

```java
@Override
    public void onError(Throwable t) {
        if (!isDisposed()) {
            lazySet(DisposableHelper.DISPOSED);
            try {
                onError.accept(t);
            } catch (Throwable e) {
                Exceptions.throwIfFatal(e);
                RxJavaPlugins.onError(new CompositeException(t, e));
            }
        } else {
            RxJavaPlugins.onError(t);
        }
    }
```

위 `onError` 변수는 맨 처음 subscribe 함수에서 전달했던 **ON_ERROR_MISSING** 입니다.

Observable을 생성하여 `onError(new Exception("Some Error"))`를 호출하면 결국 subscribe(onNext, onError) 함수의 인자로 넘긴 onError 인자로 전달합니다. 따라서 try- catch 문은 RxJava에서 활용할 수 없습니다.😒❓

<br></br>

함수 체인이나 Observable 내부에서 예외가 발생해도 onError 이벤트가 발생하고 try-catch 문으로는 해결할 수 없습니다. RxJava에서 제공해주는 예외 처리 방법을 사용해야 한다.

<br></br>

### 7.2.1 onErrorReturn() 함수와 onErrorReturnItem()

RxJava에서는 에러도 **어떠한 데이터**로 보는 것이 적절합니다. 따라서 예외 처리하는 첫 번째 방식은 예외가 발생했을 때 에러를 의미하는 다른 데이터로 대체하느 것이다.<br></br>

onError 이벤트는 데이터 흐름이 바로 중단되므로 subscribe() 함수를 호출할 때 onError 이벤트를 처리하는 것은 `Out Of Memory` 같은 프로그램 실행에 문제가 발생하는 **중대한 에러가 발생했을 때만 활용합니다.**

<br></br>

### onErrorReturn

![rxStudy/Untitled.png](rxStudy/Untitled.png)

onErrorReturn 함수는 RxJava 로직에서 에러가 발생했을 때, `Throwable` 를 인자로 전달받으며 에러에 따라서 개발자가 **원하는 데이터로 대체**하는 함수입니다. onError 이벤트는 발생하지 않습니다.<br></br>

**예제 코드**

```java
String[] grades = {"70", "88", "$100", "93"};

Observable<Integer> source = Observable.fromArray(grades)
     .map(data -> Integer.parseInt(data))
     .onErrorReturn(e -> {
           if (e instanceof NumberFormatException) {
               e.printStackTrace();
           }

            return -1;
      });

source.subscribe(data -> {
    if (data < 0) {
         Log.d("Wrong Data found!");
         return;
    }

    Log.i("Grade is " + data);
});
```

**출력**

```java
main | value = Grade is 70
main | value = Grade is 88
main | debug = Wrong Data found!

//아래는 출력 결과는 아니에요.
java.lang.NumberFormatException: For input string: "$100"
	at java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)
	at java.lang.Integer.parseInt(Integer.java:569)
	at java.lang.Integer.parseInt(Integer.java:615)
	at rxjava.Chap7.RxOne.lambda$main$0(RxOne.java:15)
```

**Integer.parseInt()** 메서드는 `NumberFormatException` 라고 하는 검증된 예외가 있습니다. 따라서 이를 처리해주어야 합니다. RxJava에서 try-catch 문이 동작하지 않기 때문에 `onErrorReturn()` 함수에서 처리하며 에러 발생 시 -1을 리턴합니다.<br></br>

데이터 소스의 데이터들은 0보다 큰 데이터(음이 될 수 없는 성적)이므로 data가 0보다 작으면 에러 발생으로 판단하여 에러 로그를 출력합니다.<br></br>

### onError에서 예외 처리

```java
String[] grades = {"70", "88", "$100", "93"};

Observable<Integer> source = Observable.fromArray(grades)
         .map(data -> Integer.parseInt(data));

source.subscribe(data -> {
           Log.i("Grade is " + data);
   }, e -> {
        if (e instanceof NumberFormatException) {
           e.printStackTrace();
        }

        Log.d("Wrong Data found!!");
  });
```

Q. 그럼 onError 이벤트에서 예외를 처리하는 것과 무엇이 다른가요?

<br></br>

**onErrorReturn을 사용하면 좋은 점**

- 예외 발생이 예상되는 부분을 선언적으로 처리
- Observable을 생성하는 측과 구독하는 측이 서로 다를 수 있다.
    - 구독자가 모두 필요한 예외 처리를 빠짐없이 하는 것은 어렵다.

      

    ```java
    String[] grades = {"70", "88", "$100", "93"};

    Observable<Integer> source = Observable.fromArray(grades)
             .map(data -> Integer.parseInt(data));

    //another class
    //에러를 모두 정의하는 것이 번거롭다.

    source.subscribe(..., e -> { ... })

    source.subscribe(..., e -> { ... })
    ```

<br></br>

### onErrorReturnItem

onErrorReturn() 함수와 비슷한 함수로 **Throwable 객체를 인자로 전달하지 않기 때문에** 코드는 좀 더 간결해집니다. **단, 예외의 종류는 확인할 수 없습니다.**<br></br>

```java
String[] grades = {"70", "88", "$100", "93"};

Observable<Integer> source = Observable.fromArray(grades)
               .map(data -> Integer.parseInt(data))
               .onErrorReturnItem(-1);

source.subscribe(data -> {
           if (data < 0) {
               Log.d("Wrong Data found!");
               return;
           }

           Log.i("Grade is" + data);
       });
}
```

### 7.2.2 onErrorResumeNext()

`onErrorResumeNext()` 는 에러가 발생했을 때 내가 원하는 **Observable로 대체하는 방법**입니다. 

에러 발생 시 데이터를 교체하는 것 뿐만 아니라 관리자에게 이메일을 보낸다던가 자원을 해제하는 등의 추가 작업을 해야할 때 유용합니다.<br></br>

![rxStudy/Untitled%201.png](rxStudy/Untitled%201.png)

**예제 코드**

```java
String[] grades = {"100", "200", "A300"};

Observable<Integer> onParseError = Observable.defer(() -> {
           Log.d("send email to administrator");
           return Observable.just(-1);
}).subscribeOn(Schedulers.io()); //IO에서 실행됨

Observable<Integer> source = Observable.fromArray(grades)
            .map(Integer::parseInt)
            .onErrorResumeNext(onParseError);

source.subscribe(data -> {
           if (data < 0) {
               Log.d("Wrong Data found!");
               return;
           }

           Log.i("Grade is" + data);
});

Thread.sleep(200) //error 예외처리가 io 스케줄러에서 실행이 되서 지연
```

**출력**

```java
main | value = Grade is 100
main | value = Grade is 200
RxCachedThreadScheduler-1 | debug = send email to administrator
RxCachedThreadScheduler-1 | debug = Wrong Data found!
```

### 7.2.3 retry() 함수

예외 처리의 다른 방법은 재시도입니다. 예를 들어 서버와 통신할 때 인터넷이 일시적으로 안되거나 서버에 일시적인 장애가 발생하면 **일정 시간 후 다시 통신을 요청하는 것이 필요합니다.**<br></br>

retry()라는 함수는 이러한 재 요청 로직을 단순하게 처리할 수 있습니다.<br></br>

![rxStudy/Untitled%202.png](rxStudy/Untitled%202.png)

retry() 함수는 Observable에서 onError 이벤트가 발생하면 바로 다시 subscribe() 함수를 호출하여 **재구독**하게 되어 있습니다.<br></br>

**예제 코드**

```java
CommonUtils.exampleStart();
        
String url = "https://api.github.com/zen";
Observable<String> source = Observable.just(url)
        .map(OkHttpHelper::getT)
        .retry(5)
        .onErrorReturn(e -> CommonUtils.ERROR_CODE);
        
source.subscribe(data -> Log.it("result : " + data));
```

**출력**

```java
main | 594 | error = api.github.com
main | 595 | error = api.github.com
main | 595 | error = api.github.com
main | 596 | error = api.github.com
main | 596 | error = api.github.com
main | 596 | value = result : -500
```

`retry(5)` 로 인해 실행 횟수를 5회로 지정, 총 5번의 재 호출 후 에러 코드 반환<br></br>

하지만 재시도하는 시간 간격이 1ms가 걸리거나, 1ms가 되지 않는 시간에 바로 재시도하고 있습니다.

이러면 대기 시간이 없어 실제로 도움이 되지 않습니다.<br></br>

### 대기 시간을 설정한 retry()

```java
@CheckReturnValue
    @SchedulerSupport(SchedulerSupport.NONE)
    public final Observable<T> retry(BiPredicate<? super Integer, ? super Throwable> predicate) {
        ObjectHelper.requireNonNull(predicate, "predicate is null");

        return RxJavaPlugins.onAssembly(new ObservableRetryBiPredicate<T>(this, predicate));
    }
```

```java
final int RETRY_MAX = 5;
final int RETRY_DELAY = 1000;
        
CommonUtils.exampleStart();

String url = "https://api.github.com/zen";
Observable<String> source = Observable.just(url)
               .map(OkHttpHelper::getT)
               .retry((retryCount, e) -> {
                    Log.e("retryCnt = " + retryCount);
               CommonUtils.sleep(RETRY_DELAY);
                    
              return retryCount < RETRY_MAX ? true : false;
          })
         .onErrorReturn(e -> CommonUtils.ERROR_CODE);

source.subscribe(data -> Log.it("result : " + data));
```

```java
main | 610 | error = api.github.com
main | error = retryCnt = 1
main | 1612 | error = api.github.com
main | error = retryCnt = 2
main | 2613 | error = api.github.com
main | error = retryCnt = 3
main | 3614 | error = api.github.com
main | error = retryCnt = 4
main | 4616 | error = api.github.com
main | error = retryCnt = 5
main | 5617 | value = result : -500
```

기본적으로 에러가 나면 무한히 재 시도하기 때문에 5회 이후에는 false를 리턴하여 종료.<br></br>

### 7.2.4 retryUntil() 함수

retryUntil()는 특정 조건이 충족될 때까지만 재시도하는 함수입니다. 

retry() 함수는 재시도를 지속할 조건이 없을 때 재시도를 중단한다면, retryUntil() 함수는 재시도를 중단할 조건이 발생할 때까지 계속 재시도합니다.<br></br>

```java
@CheckReturnValue
    @SchedulerSupport(SchedulerSupport.NONE)
    public final Observable<T> retry(BiPredicate<? super Integer, ? super Throwable> predicate) {
        ObjectHelper.requireNonNull(predicate, "predicate is null");

        return RxJavaPlugins.onAssembly(new ObservableRetryBiPredicate<T>(this, predicate));
    }

//or BooleanSupplier

public interface BooleanSupplier {
    /**
     * Returns a boolean value.
     * @return a boolean value
     * @throws Exception on error
     */
    boolean getAsBoolean() throws Exception; // NOPMD
}
```

- **BooleanSupplier** 객체는 인자는 없고 Boolean 값을 리턴하는 함수형 인터페이스

BooleanSupplier 함수의 값이 **false**이 계속 진행, **true**면 계속 재호출<br></br>

**예제 코드**

```java
CommonUtils.exampleStart();

String url = "https://api.github.com/zen";
Observable<String> source = Observable.just(url)
               .map(OkHttpHelper::getT)
               .subscribeOn(Schedulers.io())
               .retryUntil(() -> {
               if (CommonUtils.isNetworkAvailable())
                    return true; //중지

               CommonUitls.sleep(1000);
               return false; // 계속 진행
           });

source.subscribe(Log::i);

CommonUtils.sleep(5000);
```

**출력**

```java
RxCachedThreadScheduler-1 | 610 | error = api.github.com
RxCachedThreadScheduler-1 | Network is not available
RxCachedThreadScheduler-1 | 1612 | error = api.github.com
RxCachedThreadScheduler-1 | Network is not available
RxCachedThreadScheduler-1 | 2613 | error = api.github.com
RxCachedThreadScheduler-1 | Network is not available
RxCachedThreadScheduler-1 | 3614 | error = api.github.com
RxCachedThreadScheduler-1 | Network is not available
RxCachedThreadScheduler-1 | 4616 | error = api.github.com
RxCachedThreadScheduler-1 | Network is not available
```

Network가 올바르지 않으면 1000ms의 딜레이를 가진 후 재호출한다. 이 과정은 Network가 제대로 동작할 때까지 반복한다.<br></br>

### 7.2.5 retryWhen() 함수

재시도와 관련있는 함수 중 가장 복잡한 함수! 함수 원형을 이해하기가 어렵다고 해요.<br></br>

![rxStudy/Untitled%203.png](rxStudy/Untitled%203.png)

**예제 코드**

```java

Observable.create((ObservableEmitter<String> emitter) -> {
		      System.out.println("subscribing");
		      emitter.onError(new RuntimeException("always fails"));
		  }).retryWhen(attempts -> {
		      return attempts.zipWith(Observable.range(1, 3), (n, i) -> i)
				.flatMap(i -> {
		          System.out.println("delay retry by " + i + " second(s)");
		          return Observable.timer(i, TimeUnit.SECONDS);
		      });
		  }).blockingForEach(Log::d);

CommonUtils.exampleComplete();		
```

`blockingForEach` 은 subscribe( onNext )를 호출하는 것과 동일하게 데이터를 순차적으로 데이터를 발행되지만 테스트 시 주로 사용한다고 합니다.<br></br>

retryWhen() 함수 람다 표현식 인자는 `Observable<Throwable>` 로 설정되어 있기 때문에,

attempts는 `Observable<Throwable>` 형태입니다.<br></br>

**출력**

```java
subscribing
delay retry by 1 second(s)
subscribing
delay retry by 2 second(s)
subscribing
delay retry by 3 second(s)
subscribing
```

<br></br>

## 7.3 흐름 제어

흐름 제어는 Observable이 데이터를 발행하는 속도와 옵서버가 데이터를 받아서 처리하는 속도 사이의 차이가 발생할 때 사용하는 함수입니다. 예를 들어 Android에서 사용자가 버튼을 두번 빠르게 클릭하는 것을 제어할 때 사용할 수 있을 듯해요.<br></br>

### 7.3.1 sample 함수

sample() 함수는 특정한 시간 동안 **가장 최근에 발행된 데이터만 걸러줍니다.** 해당 시간에는 아무리 많은 데이터가 들어와도 해당 구간의 마지막 데이터만 발행하고 나머지는 무시합니다.<br></br>

![rxStudy/Untitled%204.png](rxStudy/Untitled%204.png)

```java
@SchedulerSupport(SchedulerSupport.COMPUTATION)
public final Observable<T> sample(long period, TimeUnit unit)
public final Observable<T> smaple(long period, TimeUnit unit, boolean emitLast)
```

계산 스케줄러에서 동작하며, `emitLast` 변수는 데이터 발행이 완료되지 않고 마지막에 데이터가 남아 있을 때 해당 데이터를 발행할 것인지 결정하는 변수입니다. 기본 값은 `false` <br></br>

**예제 코드**

```java
String[] data= {"1","7","2","3","6"};
        
//시간측정용
CommonUtils.exampleStart();
        
//앞의 4개는 100ms 간격으로 발행
Observable<String> earlySource=Observable.fromArray(data)
            .take(4)
            .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a,b)->a);
        
//마지막  데이터는 300ms 후에 발행
Observable<String> lastSource=Observable.just(data[4])
            .zipWith(Observable.timer(300L, TimeUnit.MILLISECONDS), (a,b)->a);
        
//2개의 Observable을 결합하고 300ms로 샘플링.
Observable<String> source= Observable.concat(earlySource,lastSource)
            .sample(300L,TimeUnit.MILLISECONDS);

source.subscribe(Log::it);
CommonUtils.sleep(1000);
```

**출력**

```java
RxComputationThreadPool-1 | 556 | value = 7
RxComputationThreadPool-1 | 856 | value = 3
```

<br></br>

### 7.3.2 buffer() 함수

buffer() 함수는 **일정 시간 동안 데이터를 모아두었다가 한꺼번에 발행합니다**. 따라서 넘치는 데이터 흐름을 제어할 필요가 있을 때 활용합니다.<br></br>

![rxStudy/Untitled%205.png](rxStudy/Untitled%205.png)

처음 빨간원 노란원 초록원을 발행하면 그것을 모아서 **List 객체**에 전달해 줍니다. 그 다음 다시 하늘 파랑 자주 원이 생기면 그것을 모아서 한번에 발행해 줍니다 .<br></br>

**예제 코드**

```java
String[] data={"1","2","3","4","5","6"};
CommonUtils.exampleStart();
        
//앞의 3개는 100ms 간격으로 발행
Observable<String> earlySource= Observable.fromArray(data)
            .take(3)
            .zipWith(Observable.interval(100L,TimeUnit.MILLISECONDS), (a,b)->a);
        
//가운데 1 개는 300ms 후에 발행
Observable<String> middleSource= Observable.just(data[3])
            .zipWith(Observable.timer(300L, TimeUnit.MILLISECONDS),(a,b)->a);
        
//마지막 2개는 100ms 후에 발행
Observable<String> lastSource=Observable.fromArray(data)
            .takeLast(2)
            .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS),(a,b)->a);
        
//3개씩 모아서 1번에 발행함
Observable<List<String>> source= Observable.concat(earlySource,middleSource,lastSource)
            .buffer(3);
        
        
source.subscribe(Log::it);
CommonUtils.sleep(1000);
```

**출력**

```java
RxComputationThreadPool-1 | 506 | value = [1, 2, 3]
RxComputationThreadPool-3 | 1013 | value = [4, 5, 6]
```

기본 `buffer` 함수는 필터링 없이 인자의 개수만큼 Data를 묶어서 List 형태로 데이터를 발행한다.<br></br>

### Skip하는 Buffer

![rxStudy/Untitled%206.png](rxStudy/Untitled%206.png)

```java
String[] data={"1","2","3","4","5","6"};
CommonUtils.exampleStart();
        
//앞의 3개는 100ms 간격으로 발행
Observable<String> earlySource= Observable.fromArray(data)
            .take(3)
            .zipWith(Observable.interval(100L,TimeUnit.MILLISECONDS), (a,b)->a);
        
//가운데 1 개는 300ms 후에 발행
Observable<String> middleSource= Observable.just(data[3])
            .zipWith(Observable.timer(300L, TimeUnit.MILLISECONDS),(a,b)->a);
        
//마지막 2개는 100ms 후에 발행
Observable<String> lastSource=Observable.fromArray(data)
            .takeLast(2)
            .zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS),(a,b)->a);
        
//3개씩 모아서 1번에 발행함
Observable<List<String>> source= Observable.concat(earlySource,middleSource,lastSource)
            .buffer(2, 3);
        
        
source.subscribe(Log::it);
CommonUtils.sleep(1000);
```

- skip 변수는 **count보다 값이 커야 합니다.**

`buffer(2, 3)`  2개의 데이터가 발행되면 바로 List<String>에 채워 발행하고 발행되는 데이터 1개는 건너 뜁니다. <br></br>

```java
RxComputationThreadPool-1 | 439 | value = [1, 2]
RxComputationThreadPool-3 | 941 | value = [4, 5]
```

### 7.3.3 throttleFirst()

`throttleFirst()` 는 주어진 조건에서 가장 먼저 입력된 값을 발행합니다.  sample() 함수와 비슷하지만 다릅니다. throttleFirst() 함수는 어떤 데이터를 발행하면 지정된 시간 동안 **다른 데이터를 발행하지 않도록 막습니다.**

<br></br>

![rxStudy/Untitled%207.png](rxStudy/Untitled%207.png)

**예제 코드**

```java
String[] data = {"1", "2", "3", "4", "5", "6"};
		CommonUtils.exampleStart();
		
		//앞의 1개는 100ms 간격으로 발행 
		Observable<String> earlySource = Observable.just(data[0])
				.zipWith(Observable.timer(100L, TimeUnit.MILLISECONDS), (a,b) -> a);
		
		//다음  1개는 300ms 후에 발행 
		Observable<String> middleSource = Observable.just(data[1])
				.zipWith(Observable.timer(300L, TimeUnit.MILLISECONDS), (a,b) -> a);
		
		//마지막 4개는 100ms 후에 발행 
		Observable<String> lateSource = Observable.just(data[2], data[3], data[4], data[5])
				.zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a,b) -> a)
				.doOnNext(Log::dt);
		
		//200ms 간격으로 throttleFirst() 실행함   
		Observable<String> source = Observable.concat(
				earlySource,
				middleSource,
				lateSource)
				.throttleFirst(200L, TimeUnit.MILLISECONDS);
		
		source.subscribe(Log::it);
		CommonUtils.sleep(1000);
		CommonUtils.exampleComplete();
```

**출력**

```java
RxComputationThreadPool-1 | 304 | value = 1
RxComputationThreadPool-3 | 609 | value = 2
RxComputationThreadPool-4 | 714 | debug = 3
RxComputationThreadPool-4 | 814 | debug = 4
RxComputationThreadPool-4 | 814 | value = 4
RxComputationThreadPool-4 | 914 | debug = 5
RxComputationThreadPool-4 | 1015 | debug = 6
RxComputationThreadPool-4 | 1015 | value = 6
```

### 7.3.4 window() 함수

`window()` 함수는 groupBy() 함수와 개념적으로 비슷합니다. 

groupBy() 함수는 특정 조건에 맞는 입력값들을 그룹화해 별도의 **Observable을 병렬로 만듭니다**. 반면 window() 함수는 throttleFirst() 나 sample() 함수처럼 내가 처리할 수 있는 일부의 값들만 받아들일 수 있습니다. 흐름 제어 기능에 **groupBy() 함수와 비슷한 별도의 Observable 분리 기능을 모두 갖추었다고 생각하면 됩니다.**<br></br>

![rxStudy/Untitled%208.png](rxStudy/Untitled%208.png)

```java
@SchedulerSupport(SchedulerSupport.NONE)
public final Observable<Observable<T> window(long count)
```

기본 함수 원형에서는 **count**를 인자로 받고 있으며 필터링 없이 count의 수만큼 데이터를 분리해서 발행

따라서 비동기 작업이 될 수가 없다. (될 필요가 없다)<br></br>

```java
String[] data = {"1", "2", "3", "4", "5", "6"};
		CommonUtils.exampleStart();
		
		//앞의 3개는 100ms 간격으로 발행 
		Observable<String> earlySource = Observable.fromArray(data)
				.take(3)
				.zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a,b) -> a);
		
		//가운데 1개는 300ms 후에 발행 
		Observable<String> middleSource = Observable.just(data[3])
				.zipWith(Observable.timer(300L, TimeUnit.MILLISECONDS), (a,b) -> a);
		
		//마지막 2개는 100ms 후에 발행 
		Observable<String> lateSource = Observable.just(data[4], data[5])
				.zipWith(Observable.interval(100L, TimeUnit.MILLISECONDS), (a,b) -> a);
		
		//3개씩 모아서 새로운 옵저버블을 생성함   
		Observable<Observable<String>> source = Observable.concat(
				earlySource,
				middleSource,
				lateSource)
				.window(3);
		
		source.subscribe(observable -> {
			Log.dt("New Observable Started!!");
			observable.subscribe(Log::it);
		});
		CommonUtils.sleep(1000);
		CommonUtils.exampleComplete();
```

**출력**

```java
RxComputationThreadPool-1 | 314 | debug = New Observable Started!!
RxComputationThreadPool-1 | 316 | value = 1
RxComputationThreadPool-1 | 398 | value = 2
RxComputationThreadPool-1 | 497 | value = 3
RxComputationThreadPool-2 | 802 | debug = New Observable Started!!
RxComputationThreadPool-2 | 802 | value = 4
RxComputationThreadPool-3 | 903 | value = 5
RxComputationThreadPool-3 | 1004 | value = 6
```

새로운 Observable이 생성될 때마다 "New Observable Started!!"라는 문자열을 출력하고, 그 다음 각 Observable에서 발행되는 값을 그대로 출력합니다. <br></br>

### 7.3.5 debounce() 함수

`debounce()` 함수는 빠르게 연속 이벤트를 처리하는 흐름 제어 함수입니다.

안드로이드와 같은 UI 기반의 프로그래밍에서는 유용하게 활용할 수 있습니다. <br></br>

버튼를 사용자가 빠르게 누를 경우 여러번 로직이 호출되는 경우가 있을 때 Rx를 사용하지 않는 다면 딜레이를 사용해서 제어한다면 예외 처리가 매우 번거롭고 실수할 가능성이 많다. 이런 경우 debounce() 함수를 사용한다.

![rxStudy/Untitled%209.png](rxStudy/Untitled%209.png)

```java
/**
 @param timeout : 지정한 시간
*/
@SchedulerSupport(SchdulerSupport.COMPUTATION)
public final Observable<T> debounce(long timeout, TimeUnit unit)
```

노란 공의 경우 시간 간격안에 초록 공이 다시 들어왔으므로 **노란 공을 발행하지 않고 초록 공을 발행한다.**

debounce() 함수처럼 필터링 로직을 사용하는 함수들은 **계산 스케줄러에서 동작**합니다. <br></br>

```java
String[] data = {"1", "2", "3", "5"};
		
		Observable<String> source = Observable.concat(
			Observable.timer(100L, TimeUnit.MILLISECONDS).map(i -> data[0]),
			Observable.timer(300L, TimeUnit.MILLISECONDS).map(i -> data[1]),
			Observable.timer(100L, TimeUnit.MILLISECONDS).map(i -> data[2]),
			Observable.timer(300L, TimeUnit.MILLISECONDS).map(i -> data[3]))
			.debounce(200L, TimeUnit.MILLISECONDS);
		
		source.subscribe(Log::i);
		CommonUtils.sleep(1000);
		CommonUtils.exampleComplete();
```

```java
RxComputationThreadPool-2 | value = 1
RxComputationThreadPool-2 | value = 3
RxComputationThreadPool-2 | value = 5
```

concat 함수 내 Observable이 한번에 병렬적으로 실행되는 것이 아닌, 순차적으로 실행<br></br>

2의 데이터가 발행된 후 100ms 후 3의 데이터가 발행되었습니다. 이러면 200ms imeout 시간 안에 3의 데이터가 발행된 것으로 2의 데이터가 무시되고 3의 데이터가 발행됩니다.<br></br>
