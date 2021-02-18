---
title: "코루틴(Coroutine)의 일시 중단 함수 사용하기"
date: "2021-02-19"
tags: ["d2fault", "mash-up", "kotlin", "coroutine", "android"]
description: "이번 포스팅에서는 코루틴의 일시 중단 함수를 조합하여 활용하는 방법을 알아봅니다."
cover: "./ic_coroutine.jpg"
---

# Composing Suspending Functions

이번 포스팅에서는 코루틴의 일시 중단 함수를 조합하여 활용하는 방법을 알아본다.

※ IntelliJ나 Android Studio가 설치되어 있지 않다면 Kotlin 공식 사이트에서 지원하는 **온라인 IDE([Kotlin Playground](https://play.kotlinlang.org/))를 사용하여 아래 코드를 실행할 수 있다.**

<br>

## Sequential by default

아래 코드는 어떤 유용한 기능(?) 두 가지를 순차적으로 실행 및 조합하여 결과를 내도록 구현되어 있다.

```kotlin
fun main() = runBlocking<Unit> {
    val time = measureTimeMillis {
        val one = doSomethingUsefulOne()
        val two = doSomethingUsefulTwo()
        println("The answer is ${one + two}")
    }
    println("Completed in $time ms")    
}

suspend fun doSomethingUsefulOne(): Int {
    // pretend we are doing something useful here
    delay(1000L)
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    // pretend we are doing something useful here, too
    delay(1000L)
    return 29
}
```

**코루틴에서는 일반 코드처럼 작성하면 비동기적인 기능일지라도 순차적으로 실행한다.** 즉, 위의 코드는

1. `doSomethingUsefulOne()` 실행
2. `doSomethingUsefulTwo()` 실행
3. `println("The answer is ${one + two}")` 실행

순서로 진행된다.

<br>

## Concurrent using async

만약 두 연산에 dependency가 없다면 동시에 실행하는 것이 리소스를 효율적으로 사용할 수 있을 것이다. 아래 코드를 참고하자.

```kotlin
fun main() = runBlocking<Unit> {
    val time = measureTimeMillis {
        val one = async { doSomethingUsefulOne() }
        val two = async { doSomethingUsefulTwo() }
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // pretend we are doing something useful here
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // pretend we are doing something useful here, too
    return 29
}
```

코루틴 빌더인 ` async` 키워드를 사용하면 비동기를 비동기처럼(?) 동작하게 할 수 있다.

<br>

## Lazily started async

`async` 로 실행하는 코루틴을 '나중에' 실행하는 방법을 보여주는 예제이다.

```kotlin
fun main() = runBlocking<Unit> {
    val time = measureTimeMillis {
        val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        // some computation
        one.start() // start the first one
        two.start() // start the second one
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // pretend we are doing something useful here
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // pretend we are doing something useful here, too
    return 29
}
```

`async` 의 매개변수에 `start = CoroutineStart.LAZY` 를 추가하게 되면 해당 코루틴은 바로 실행되지 않는다. `LAZY` 가 걸린 코루틴을 `start()` 하거나 `await()` 를 해 줄 때 비로소 값을 받을 수 있다.

`async` 는 인자를 받을 수 있는데, 아무 인자도 넣지 않으면 바로 실행하는(`start = CoroutineStart.Default`) 것이 default이다. 즉, `start()` 나 `await()` 를 만나지 않아도 내부적으로는 이미 그 코루틴이 실행된 상태라는 의미이다. 다음의 코드를 실행해 보면 이해가 조금 쉬울 듯하다.

```kotlin
fun main() = runBlocking<Unit> {
    var a = 0
    var b = 0
    val time = measureTimeMillis {
        val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
        val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
        // some computation
        one.start() // start the first one
        two.start() // start the second one
        println("The answer is ${one.await() + two.await()}")
    }
    println("Completed in $time ms")    
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // pretend we are doing something useful here
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // pretend we are doing something useful here, too
    return 29
}
```

### 참고

- `start()`
  - 코루틴을 시작한다. 시작할 수 있으면 `true`, 없으면 `false` 를 반환한다.
- `await()`
  - 이미 `start()` 된 코루틴의 경우 실행된 값을 반환하고, `start()` 되기 전 코루틴이라면 실행 및 값을 반환한다.

<br>

## Async-style functions

**이렇게 사용하지 마라고 권고하는** 내용의 예제이다. async-style의 함수는 exception이 발생했을 때 돌이킬 수 없는 상황에 봉착하게 된다. (exception이 발생되어도 코루틴이 죽지 않고 좀비로 남는 모습을 볼 수 있음.)

```kotlin
// note that we don't have `runBlocking` to the right of `main` in this example
fun main() {
    val time = measureTimeMillis {
        // somethingUseful~ 함수는 suspend 함수가 아님(누구나 실행 가능)
        val one = somethingUsefulOneAsync()
        val two = somethingUsefulTwoAsync()
        // but waiting for a result must involve either suspending or blocking.
        // here we use `runBlocking { ... }` to block the main thread while waiting for the result
        runBlocking {
            println("The answer is ${one.await() + two.await()}")
        }
    }
    println("Completed in $time ms")
}

fun somethingUsefulOneAsync() = GlobalScope.async {
    // doSomethingUseful~ 함수는 suspend 함수임
    doSomethingUsefulOne()
}

fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // pretend we are doing something useful here
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // pretend we are doing something useful here, too
    return 29
}
```

코루틴을 **아무 곳에서나 마구 사용할 수 있게 만든 위와 같은 코드는 절대적으로 지양해야 한다.**

<br>

## Structured concurrency with async

이전 예제에서 안 좋은 코드를 예로 들었다면, 이번 코드는 권장하는 스타일을 제안한다.

```kotlin
fun main() = runBlocking<Unit> {
    val time = measureTimeMillis {
        println("The answer is ${concurrentSum()}")
    }
    println("Completed in $time ms")    
}

// coroutineScope로 감싸서 suspend function으로 바꿔주었다.
// suspend function은 아무 곳에서나 호출할 수 있는 형태가 아닌 코루틴 내에서만 사용 가능
suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}

suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // pretend we are doing something useful here
    return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // pretend we are doing something useful here, too
    return 29
}
```

위의 예제처럼 scope 안에서 suspending function들을 조립해서 사용해야 한다. **exception이 발생할 경우 코루틴 블록 내부의 모든 코루틴이 취소되어 우리의 코드는 안전할 것임.** 코루틴 좀비 해결!

<br>

## Cancellation propagated coroutines hierarchy

아래 예제는 `async` 로 작성된 코루틴에서 exception이 발생할 경우 어떤 결과가 나타날지 시뮬레이션해 보는 코드이다.

```kotlin
fun main() = runBlocking<Unit> {
    try {
        failedConcurrentSum()
    } catch(e: ArithmeticException) {
        println("Computation failed with ArithmeticException")
    }
}

suspend fun failedConcurrentSum(): Int = coroutineScope {
    val one = async<Int> { 
        try {
            delay(Long.MAX_VALUE) // Emulates very long computation
            42
        } finally {
            println("First child was cancelled")
        }
    }
    val two = async<Int> { 
        println("Second child throws an exception")
        throw ArithmeticException()
    }
    one.await() + two.await()
}
```

**`asnyc` 로 실행된 코루틴 중 하나의 코루틴에서 exception이 발생할 경우, 이 exception은 다른 코루틴에게 영향을 주어 결국 모든 코루틴이 중단되게 한다.**

<br>

# 정리

- 일반 코드처럼 코틀린 코드를 작성할 경우 순서대로 동작한다.
- 일반 비동기 코드처럼 동시에 실행하고 싶다면 코루틴 빌더인 `async` 를 이용하자.
- 코루틴을 일반 함수로 감싸 아무 곳에서나 실행할 수 있는 미친 짓은 절대로 하지 말자. (exception 터질 때 감당 불가)

<br>

# 참고

- [코루틴 공식 문서 - Composing Suspending Functions](https://kotlinlang.org/docs/reference/coroutines/composing-suspending-functions.html)
- [새차원의 코틀린 코루틴 강좌 #4 - Composing Suspending Functions](https://youtu.be/0viswXto028)
- [d2fault.github.io](https://d2fault.github.io/2021/02/19/20210219-coroutine-composing-suspending-functions/)

<br>