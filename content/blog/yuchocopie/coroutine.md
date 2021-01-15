---
title: Coroutine 기초
date: "2020-12-19"
tags: ["start", "mash-up", "chocopie", "코루틴", "기본개념"]
description: "코루틴에서 기본으로 알면 좋을 것들입니다."
cover: "./ic_cover.png"
---



안녕하세요 유초코입니다 :)

안드로이드에서 사용하는 비동기 라이브러리는 rx와 coroutine을 꼽을 수 있는데요.

*coroutine*은 비동기적으로 실행되는 코드를 간소화하기 위해 Android에서 사용할 수 있는 동시 실행 설계 패턴입니다. Android에서 코루틴은 main 스레드를 차단하여 앱이 응답하지 않게 만들 수도 있는 long-running tasks 를 관리하는 데 도움이 됩니다.

 이번 글에서는 Kotlin 코루틴을 사용하여 코드를 작성하는 방법을 살펴보려 합니다!



## 기능

- **Lightweight**(**경량**): 코루틴을 실행 중인 스레드를 차단하지 않는 [_정지(suspension)_](https://kotlinlang.org/docs/reference/coroutines/basics.html)를 지원하므로 단일 스레드에서 많은 코루틴을 실행할 수 있습니다. suspension은 많은 동시 작업을 지원하면서도 blocking 보다 메모리를 절약합니다.
- **Fewer memory leaks**(**메모리 누수 감소**): [_구조화된 동시 실행_](https://kotlinlang.org/docs/reference/coroutines/basics.html#structured-concurrency)을 사용하여 범위 내에서 작업을 실행합니다.
- **Built-in cancellation support** (**기본으로 제공되는 취소 지원**): 실행 중인 코루틴 계층 구조를 통해 자동으로 [취소](https://kotlinlang.org/docs/reference/coroutines/cancellation-and-timeouts.html)가 전달됩니다.
- **Jetpack 통합**: 많은 Jetpack 라이브러리에 코루틴을 완전히 지원하는 [확장 프로그램](https://developer.android.com/kotlin/ktx?hl=ko)이 포함되어 있습니다. 일부 라이브러리는 구조화된 동시 실행에 사용할 수 있는 자체 [코루틴 범위](https://developer.android.com/topic/libraries/architecture/coroutines?hl=ko)도 제공합니다.



## 코루틴 기초

```kotlin
import  kotlinx.coroutines. *

fun  main () {
     GlobalScope .launch { //백그라운드에서 새 코 루틴을 시작
        delay ( 1000L ) // 1초 지연 (기본 시간 단위는 ms)
        println ( " World! " ) // 지연 이후 print
    }
    println ( " Hello, " ) // 코루틴이 지연되는 동안 메인 스레드는 계속된다
    Thread .sleep ( 2000L ) // JVM을 유지하기 위해 2초동안 메인 스레드를 차단
    println("sleep2000")
}
```

백그라운드에서 새 코루틴을 시작하고  1초 지연 (기본 시간 단위는 ms) 딜레이를 가진 후에 "World"를 출력합니다. 만약  `Thread .sleep ( 2000L) `  을 해주지 않게 된다면  main 함수의 실행을 종료하기 때문에 코루틴 함수를 실행하지 않고 종료하게 됩니다.

-  결과

  ```
  Hello,
  World!
  sleep2000
  ```

- `GlobalScope.launch { ... }` 와 `delay(...)` 는 
  `thread { ... }` ,`Thread.sleep(...)` 의 쓰임과 같다고 볼 수 있습니다.

  ```kotlin
  GlobalScope.launch {
  	delay(1000L)
  	println("World!")
  }
  ```

  ```kotlin
  thread {
  	Thread.sleep(1000)
  	println("thread!")
  }
  ```



## 주요 키워드

- CoroutineScope (GlobalScope)
- CoroutineContext
- Dispatcher
- launch & async



# 코루틴은 사용

1. 사용할 Dispatcher 를 결정합니다
2. Dispatcher 를 이용해서 CoroutineScope (코루틴 블록을 묶음으로 제어할수 있는 단위)를 만듦니다
3. CoroutineScope의 launch 또는 async 에 수행할 코드 블록을 넘깁니다

## CoroutineScope

- CoroutineScope: 코루틴의 범위, 코루틴 블록을 묶음으로 제어할수 있는 단위

- GlobalScope : CoroutineScope 의 한 종류로 전체 어플리케이션 수명 동안에 작동하고, 취소되지 않는 최상위 수준의 동시 처리를 시작하는데 사용

  > 응용 프로그램 코드는 일반적으로 응용 프로그램 정의 [CoroutineScope를](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-scope/index.html) 사용해야하며 , [GlobalScope](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/index.md) 인스턴스에서 [비동기](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html) 또는 [시작](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) 을 사용하는 것은 매우 권장되지 않습니다.

## CoroutineContext

- CoroutineContext 는 코루틴을 어떻게 처리 할것인지 에 대한 여러가지 정보의 집합
- 주요 요소 로는 Job 과 dispatcher 가 있다.

## Dispatcher

- Dispatcher 는 CoroutineContext 의 주요 요소로 해당 Coroutine이 실행을 위해 사용하는 스레드를 정의 해두었습니다

> - [Dispatchers.Default](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) : 디스패처 또는 기타 [ContinuationInterceptor](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation-interceptor/index.html) 가 컨텍스트에 지정 되지 않은 경우 모든 표준 빌더에서 사용됩니다 . 공유 백그라운드 스레드의 공통 풀을 사용합니다.
>   이는 **CPU 사용량이 많은 작업**에 적합하다.
> - [Dispatchers.IO](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html) — 요청시 생성 된 스레드의 공유 풀을 사용하며 IO 작업이나 작업을 차단하는 것에 적합합니다.
>
> - Dispatchers.Main : 응용 프로그램 "Main"또는 "UI"스레드로 제한되고 코루틴이 이미 올바른 컨텍스트에있을 때 즉시 실행하는 디스패처를 반환, 안드로이드의 경우 UI 스레드를 사용
>
> - [Dispatchers.Unconfined](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-unconfined.html) — 첫 번째 중단까지 현재 호출 프레임에서 코 루틴 실행을 시작합니다. 이때 코 루틴 빌더 함수가 반환됩니다. 코 루틴은 특정 스레드 또는 풀로 제한하지 않고 해당 일시 중단 함수에서 사용하는 스레드에서 나중에 다시 시작됩니다. **디스패처는 일반적으로 코드에서 사용할 수 없음** .
>
> ```
> unconfined dispatcher는 코루틴의 일부 작업을 즉시 수행해야하기 때문에 나중에 실행하기 위해 코 루틴을 디스패치 할 필요가 없거나 원하지 않는 부작용을 생성하는 특정코너 경우에 도움이 될 수있는 고급 메커니즘이다. 제한되지 않은 디스패처는 일반 코드에서 사용해서는 안된다.
> ```
>
> - [newSingleThreadContext](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/new-single-thread-context.html) 는 코루틴이 실행할 스레드를 생성합니. 전용 스레드는 매우 비싼 리소스로 실제 애플리케이션에서는 더 이상 필요하지 않을 때 [닫기](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-executor-coroutine-dispatcher/close.html) 함수를 사용하여 해제 하거나 최상위 변수에 저장하고 애플리케이션 전체에서 재사용해야합니다.

- Dispatcher example

  ```kotlin
  launch { // context of the parent, main runBlocking coroutine
      println("main runBlocking : I'm working in thread ${Thread.currentThread().name}")
  }
  launch(Dispatchers.Unconfined) { // not confined -- will work with main thread
      println("Unconfined : I'm working in thread ${Thread.currentThread().name}")
  }
  launch(Dispatchers.Default) { // will get dispatched to DefaultDispatcher
      println("Default : I'm working in thread ${Thread.currentThread().name}")
  }
  launch(newSingleThreadContext("MyOwnThread")) { // will get its own new thread
      println("newSingleThreadContext: I'm working in thread ${Thread.currentThread().name}")
  }
  ```

  - result

  ```
  main runBlocking      : I'm working in thread main
  Unconfined            : I'm working in thread main
  Default               : I'm working in thread DefaultDispatcher-worker-1
  newSingleThreadContext: I'm working in thread MyOwnThread
  ```

  - main runBlocking : `launch { ... }` 의 경우 파라미터없이 사용되며, 실행 중인 Coroutine Scope에서 컨텍스트(따라서 디스패처)를 상속한다. 이 경우 주 스레드에서 실행되는 main `runBlocking` coroutine 의 컨텍스트를 상속합니.

  - Unconfined : `main`스레드 에서 실행되는 것처럼 보이는 특수 디스패처 이지만 실제 메커니즘은 아래서 다룹니다.

  - Default : [GlobalScope](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-global-scope/index.html) 에서 시작될 때 사용되는 기본 디스패처는 [Dispatchers.Default](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-default.html) 로 표시되며
    기본적으로 공유 백그라운드 스레드 풀을 사용하므로 디스패쳐를 실행합니다.
`launch(Dispatchers.Default) { ... }`에서 `GlobalScope.launch { ... }`와 동일한 발송자를 사용.
    
  - newSingleThreadContext : 자체 새 스레드를 가져온다

* Dispatchers.Unconfined example

  ```kotlin
  launch(Dispatchers.Unconfined) { // not confined -- will work with main thread
      println("Unconfined      : I'm working in thread ${Thread.currentThread().name}")
      delay(500)
      println("Unconfined      : After delay in thread ${Thread.currentThread().name}")
  }
  launch { // context of the parent, main runBlocking coroutine
      println("main runBlocking: I'm working in thread ${Thread.currentThread().name}")
      delay(1000)
      println("main runBlocking: After delay in thread ${Thread.currentThread().name}")
  }
  ```

  - result

  ```
  Unconfined      : I'm working in thread main
  main runBlocking: I'm working in thread main
  Unconfined      : After delay in thread kotlinx.coroutines.DefaultExecutor
  main runBlocking: After delay in thread main
  ```

  - Dispatcher를 Unconfined로 설정하면, 해당 coroutine은 callar thread에서 시작됩니다.

    단, 이 코루틴이 **suspend되었다가 상태가 재시작 되면 적절한 thread에 재할당되어 시작된다**

  - Unconfined는 CPU time을 소비하지 않는 작업이나, 공유되는 데이터에 접근하지 않아야 하는 작업들에서 이용하는게 적절합니다.

    > 특정 스레드로 지정되어 처리되어야 하는경우에는 사용하지 않는다.

  - UI 처럼 main thread에서만 수행되어야 하는 작업들은 unconfined로 지정하면 안된다

    > unconfined dispatcher는 코루틴의 일부 작업을 즉시 수행해야하기 때문에 나중에 실행하기 위해 코 루틴을 디스패치 할 필요가 없거나 원하지 않는 부작용을 생성하는 특정코너 경우에 도움이 될 수있는 고급 메커니즘이다. 제한되지 않은 디스패처는 일반 코드에서 사용해서는 안된다.

## launch & async

- [`launch`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/launch.html) 는 새 코루틴을 시작하고 호출자에게 결과를 반환하지 않는다.
  '실행 후 삭제'로 간주되는 모든 작업은 `launch`를 사용하여 시작할 수 있다.
- [`async`](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/async.html)는 새 코루틴을 시작하고 `await`라는 정지 함수로 결과를 반환하도록 허용한다.

> 보통 일반 함수는 `await`를 호출할 수 없으므로 일반 함수에서 새 코루틴을 `launch`해야 합니다. `async`는 다른 코루틴 내부에서만 사용하거나 suspend 함수 내에서 병렬 분해를 실행할 때 사용합니다.
>
> ---
>
> **경고:** `launch`와 `async`는 예외를 서로 다르게 처리합니다. `async`는 최종 `await` 호출을 예상하므로 예외를 보유하고 `await` 호출의 일부로 예외를 다시 발생시킵니다. 즉, `await`를 사용하여 일반 함수에서 새 코루틴을 시작하는 경우 예외를 자동으로 삭제할 수 있습니다. 이렇게 삭제된 예외는 비정상 종료 측정항목에 나타나지 않거나 logcat에 기록되지 않습니다. 자세한 내용은 [코루틴의 취소 및 예외](https://medium.com/androiddevelopers/cancellation-in-coroutines-aa6b90163629)를 참조하세요.

## launch & job

- **launch 는 현재 스레드를 차단하지 않고 새 코루틴을 시작하며 코루틴에 대한 참조를 [Job](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/index.html) 으로 반환**

```kotlin
val job : Job = launch { ... }
```

#### job 의 lifecycle

```
                                          wait children
    +-----+ start  +--------+ complete   +-------------+  finish  +-----------+
    | New | -----> | Active | ---------> | Completing  | -------> | Completed |
    +-----+        +--------+            +-------------+          +-----------+
                     |  cancel / fail       |
                     |     +----------------+
                     |     |
                     V     V
                 +------------+                           finish  +-----------+
                 | Cancelling | --------------------------------> | Cancelled |
                 +------------+                                   +-----------+
```

> [coroutineContext](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/coroutine-context.html) 의 `Job`인스턴스는 [코루틴](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/coroutine-context.html) 자체를 나타낸다.

- [start](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/start.html) : 현재의 coroutine의 동작 상태를 체크하며, 동작 중인 경우 true, 준비 또는 완료 상태이면 false를 return 한다.
- [join](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/join.html) : 현재의 coroutine 동작이 끝날 때까지 대기한다. 다시 말하면 async {} await처럼 사용할 수 있다.
- [cancel](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/cancel.html) : 현재 coroutine을 즉시 종료하도록 유도만 하고 대기하지 않는다. 다만 타이트하게 동작하는 단순 루프에서는 delay가 없다면 종료하지 못한다.

### job example

```kotlin
  //1
  val job = GlobalScope.launch { ... }
  //2
  val job = Job()
  CoroutineScope(Dispatchers.Default + job).launch { ... }
```

- 여러개의 launch 코루틴 블록을 실행
  :: 여러개의 launch 코루틴 블록을 실행할 경우 각각의 Job 객체에 대해서 join() 함수로 코루틴 블록이 완료 될때까지 다음 코드 수행을 대기할수 있다.

```kotlin
        val job1 = launch {
            println("Job1 one scope for start")
            var i = 0
            for (index in 0..5) {
                delay(100)
                println("Job1 one scope  $i ")
            }
        }

        val job2 = launch {
            println("Job2 two scope for start")
            for (index in 0..2) {
                println("Job2 one scope index $index")
                delay(100)
            }
        }
//        job1.join()
//        job2.join()
        joinAll(job1, job2)
```

- result

```
Job1 one scope for start
Job2 two scope for start
Job2 one scope index 0
Job2 one scope index 1
Job1 one scope  0
Job2 one scope index 2
Job1 one scope  1
Job1 one scope  2
Job1 one scope  3
Job1 one scope  4
Job1 one scope  5
```

- 반환받은 Job 객체를 두 번째 launch 의 인자로 사용하면 Job 객체 하나로도 두개의 코드블록을 제어 할 수 있다.

```kotlin
        val job1 = GlobalScope.launch {
            println("Job1 one scope for start")
            var i = 0
            for (index in 0..5) {
                delay(100)
                println("Job1 one scope  $index ")
            }
        }
         launch (job1){
            println("Job2 two scope for start")
            for (index in 0..2) {
                println("Job2 one scope index $index")
                delay(100)
            }
        }
        job1.join()
```

## async() — Deferred

async() 함수로 시작된 코루틴 블록은 Deferred 객체를 반환

```kotlin
val deferred : Deferred<T> = async {...}
```

#### Deferred example

```kotlin
    val deferred : Deferred<String> = async {
        var i = 0
        for (index in 0..5) {
            println("async index $index")
            delay(100)
        }
        "결과를 반환"
    }
    val msg = deferred.await()
    println(msg) // result 출력
```

- launch 의 job과 같이 반환받은 deferred 객체를 두 번째 async 의 인자로 사용하면 deferred 객체 하나로도 두개의 코드블록을 제어 할 수 있다.

```kotlin
    val deferred : Deferred<String> = async {
        var i = 0
        for (index in 0..5) {
            println("async1 index $index")
            delay(100)
        }
        "결과 1"
    }
    async(deferred) {
        var i = 0
        for (index in 0..5) {
            println("async2 index $index")
            delay(100)
        }
        "결과 2"
    }

    val msg = deferred.await()
    println(msg) // 결과 1 출력
```

## 지연 실행

코루틴은 launch 나 async 메소드가 실행되면 바로 시작되지만 LAZY 를 사용해 처리시점을 지연시킬 수 있다.

각 코루틴 블록 함수의 start 인자에 CoroutineStart.LAZY 를 사용하면 해당 코루틴 블록은 지연 된다.

```kotlin
val job = launch (start = CoroutineStart.LAZY) {...}
또는
val deferred = async (start = CoroutineStart.LAZY) {...}
```

- launch 코루틴 블록을 지연 실행 시킬 경우 Job 클래스의 `job.start()또는job.join()`함수 를 호출하는 시점에 launch 코드 블록이 실행된다.

- async 코루틴 블록을 지연 실행 시킬 경우 Deferred 클래스의 `deferred.start()또는deferred.await()` 함수를 호출하는 시점에 async 코드 블록이 실행된다.

  > 지연된 async 코루틴 블록 의 경우 start() 함수는 async 코루틴 블록을 실행 시키지만 블록의 수행 결과를 반환하지 않는다. 또한 await() 함수와 다르게 코루틴 블록이 완료 되는것을 기다리지도 않는다.

  - `deferred.await()` 함수를 사용해 async 코드 블록이 실행

  ```kotlin
    println("stat")
      val deferred= async (start = CoroutineStart.LAZY){
          var i = 0
          for (index in 0..5) {
              println("async1 index $index")
              delay(100)
          }
      }
      deferred.await()
      println("end")
  ```

  - result : end 가 실행 후에 호출된다

  ```
  stat
  async1 index 0
  async1 index 1
  async1 index 2
  async1 index 3
  async1 index 4
  async1 index 5
  end
  ```

  - `deferred.start()`함수를 사용해 async 코드 블록이 실행

  ```kotlin
      println("stat")
      val deferred= async (start = CoroutineStart.LAZY){
          var i = 0
          for (index in 0..5) {
              println("async1 index $index")
              delay(100)
          }
      }
      deferred.start()
      println("end")
  ```
  
  - result : end는 start가 출력되자마자 출력한다.
  
    ~~~
    stat
    end
    async1 index 0
    async1 index 1
    async1 index 2
    async1 index 3
    async1 index 4
    async1 index 5
    ~~~
  
  ### runBlocking()
  
  runBlocking() 함수는 코드 블록이 작업을 완료할 때 까지 기다린다.
  
  ~~~
  runBlocking {
  ...
  }
  ~~~
  
  단순히 join 같은 메소드 기능이 아닌 현재 thread 를 block 하고 실행되는 코드이므로 메인 thread 사용에 주의해야한다.
  
  안드로이드 의 경우 runBlocking() 함수를 메인 thread (UI thread) 에서 호출하여 시간이 오래 걸리는 작업을 수행하는 경우 ANR 이 발생할 위험이 있으므로 주의해야하며 일반적인 Blocking 코드와 suspend 스타일로 적힌 라이브러리들을 bridge해줄 모적으로 설계된 함수로 메인 함수나 테스트에서 사용하는 것이 바람직하다.
  
  하지만 runBlocking() 함수로 시작된 블록은 아무런 추가 함수 호출 없이 해당 블록이 완료될때까지 기다릴수 있습니다.
  
  주의해야 할것은 runBlocking 코루틴 블록이 사용하는 스레드는 현재 runBlocking() 함수가 호출된 스레드가 된다는 것입니다.
  
  
  
  #### reference
  
  ---
  
  https://github.com/Kotlin/kotlinx.coroutines
  https://kotlinlang.org/docs/reference/coroutines/coroutine-context-and-dispatchers.html

