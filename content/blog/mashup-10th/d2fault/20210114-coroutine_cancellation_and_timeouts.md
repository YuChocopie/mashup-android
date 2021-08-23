---
title: "코루틴(Coroutine) 취소와 타임아웃"
date: "2021-01-20"
tags: ["d2fault", "mash-up", "kotlin", "coroutine", "android"]
description: "코루틴의 Cancellation과 Timeout을 다루는 글입니다."
cover: "./ic_coroutine.jpg"
---

# Cancellation and Timeouts

이번 게시글에서는 코루틴의 취소와 timeout 처리에 대해 알아보자.

※ IntelliJ나 Android Studio가 설치되어 있지 않다면 Kotlin 공식 사이트에서 지원하는 **온라인 IDE([Kotlin Playground](https://play.kotlinlang.org/))를 사용하여 아래 코드를 실행할 수 있다.**

<br>

## Cancelling coroutine execution

`launch` 에서 반환되는  `job` 객체는 코루틴을 취소할 수 있는 기능을 제공해 준다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        repeat(1000) { i ->
            println("job: I'm sleeping $i ...")
            delay(500L)
        }
    }
    delay(1300L) // delay a bit
    println("main: I'm tired of waiting!")
    job.cancel() // cancels the job
    job.join() // waits for job's completion 
    println("main: Now I can quit.")
}
```

`job.cancel()` 을 이용하여 실행 중인 `job` 을 취소할 수 있다.

<br>

## Cancellation is cooperative

코루틴이 취소되기 위해서는 일종의 조건이 필요하다. ~~그래서 협력적(cooperative)이라는 단어를 사용한 듯하다.~~

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    val job = launch(Dispatchers.Default) {
        var nextPrintTime = startTime
        var i = 0
        while (i < 5) { // computation loop, just wastes CPU
            // print a message twice a second
            if (System.currentTimeMillis() >= nextPrintTime) {
                println("job: I'm sleeping ${i++} ...")
                nextPrintTime += 500L
            }
        }
    }
    delay(1300L) // delay a bit
    println("main: I'm tired of waiting!")
    job.cancelAndJoin() // cancels the job and waits for its completion
    println("main: Now I can quit.")
}
```

얼핏 보기에는 위의 코드가 정상적으로 취소될 것 같지만 실제 돌려보면 취소가 되지 않는 것을 볼 수 있다. **코루틴을 취소하려면 해당 코루틴에 suspend 함수가 포함되어야 하는데** 위의 `launch` 안에는 어떠한 suspend 함수도 포함되지 않았기에 원하는 결과가 나오지 않은 것이다.

위의 코드를 취소 가능한 코드로 만드려면 어떻게 해야 할까? 이전 포스팅에 정리했던 대표적인 suspend 함수, `delay` 를 호출하면 된다. `if` 문 안에 살짝 추가해 보자.

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    val job = launch(Dispatchers.Default) {
        var nextPrintTime = startTime
        var i = 0
        while (i < 5) {
            if (System.currentTimeMillis() >= nextPrintTime) {
                // 이곳에 delay를 추가했다.
                delay(1L)
                println("job: I'm sleeping ${i++} ...")
                nextPrintTime += 500L
            }
        }
    }
    delay(1300L)
    println("main: I'm tired of waiting!")
    job.cancelAndJoin()
    println("main: Now I can quit.")
}
```

`delay()` 하나 추가했을 뿐인데 아주 정상적으로 종료된다.

<br>

## Making computation code cancellable

### 1. Suspend 함수를 주기적으로 호출

공식적으로 cancellable한 코드로 만드는 방법 두 가지 중 첫 번째 방법이다. 바로 `yield`! **`yield`를 사용하면 일시중지 및 재개시 exception까지 처리할 수 있다.**

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    val job = launch(Dispatchers.Default) {
        // try-catch로 error message를 출력
        try {
           var nextPrintTime = startTime
            var i = 0
            while (i < 5) {
                if (System.currentTimeMillis() >= nextPrintTime) {
                    // 이곳에 yield를 추가했다.
                    yield()
                    println("job: I'm sleeping ${i++} ...")
                    nextPrintTime += 500L
                }
            } 
        } catch (e: Exception) {
            kotlin.io.println("Exception [$e]")
        }
        
    }
    delay(1300L)
    println("main: I'm tired of waiting!")
    job.cancelAndJoin()
    println("main: Now I can quit.")
}
```

<br>

### 2. 명시적으로 상태(`isActive`)를 체크하여 코루틴 취소

`cancel` 요청이 들어오면 `isActive` 상태가 `false` 로 변경되어 `while` 문에서 탈출할 수 있다! 아래 코드로 확인하자.

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    val job = launch(Dispatchers.Default) {
        var nextPrintTime = startTime
        var i = 0
        while (isActive) { // cancellable computation loop
            // print a message twice a second
            if (System.currentTimeMillis() >= nextPrintTime) {
                println("job: I'm sleeping ${i++} ...")
                nextPrintTime += 500L
            }
        }
    }
    delay(1300L) // delay a bit
    println("main: I'm tired of waiting!")
    job.cancelAndJoin() // cancels the job and waits for its completion
    println("main: Now I can quit.")
}
```

`isActive` 를 사용하여 취소될 경우, `yield`와 다르게 `exception` 을 던지지 않는다는 차이가 있다. 

<br>

## Closing resources with finally

코루틴 종료시 리소스를 어떻게 해제할 수 있는지 알아보는 예제이다. 서버와 통신하거나, DB를 사용할 때 갑자기 코루틴이 종료된다면 해당 리소스를 닫아 주어야 하는데, 이번 예제를 통해 그 방법을 배울 수 있다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("job: I'm sleeping $i ...")
                delay(500L)
            }
        } finally {
            // finally에서 해제해 주면 됨!
            println("job: I'm running finally")
        }
    }
    delay(1300L) // delay a bit
    println("main: I'm tired of waiting!")
    job.cancelAndJoin() // cancels the job and waits for its completion
    println("main: Now I can quit.")
}
```

`finally` 블록 안에 리소스 처리 코드를 작성해 주면 된다.

<br>

## Run non-cancellable block

이미 cancel된 코루틴 안에서 또 코루틴을 호출하여 종료해야 하는 특수 케이스의 예이다.

```kotlin
fun main() = runBlocking {
    val job = launch {
        try {
            repeat(1000) { i ->
                println("job: I'm sleeping $i ...")
                delay(500L)
            }
        } finally {
            // withContext에 NonCancellable을 전달
            withContext(NonCancellable) {
                println("job: I'm running finally")
                delay(1000L)
                println("job: And I've just delayed for 1 sec because I'm non-cancellable")
            }
        }
    }
    delay(1300L) // delay a bit
    println("main: I'm tired of waiting!")
    job.cancelAndJoin() // cancels the job and waits for its completion
    println("main: Now I can quit.")    
}
```

IDE에서 실행해 보면 종료된 코루틴 안에 코루틴이 돌아서 해당 코루틴이 종료되기 전까지 main 함수가 종료되지 않는 것을 확인할 수 있다. ~~"아직 잠깐 기다려!!!!!! 나 일 하나만 더 하고!!!!!!!"의 느낌을 받았다.~~

<br>

## withTimeout

코루틴을 실행할 때 특정 시간이 지나면 이 코루틴은 취소된다! 라고 timeout을 지정하는 방식이다.

```kotlin
fun main() = runBlocking {
    withTimeout(1300L) {
        repeat(1000) { i ->
            println("I'm sleeping $i ...")
            delay(500L)
        }
    }
}
```

위 예제에서는 1.3초 이후 timeout으로 인해 작업이 중단되지만, `runBlocking` 으로 내부에서 실행했기 때문에 exception이 발생한다. 이 exception을 해결할 수 있는 키워드를 다음 예제에서 소개한다.

<br>

## withTimeoutOrNull

```kotlin
fun main() = runBlocking {
    val result = withTimeoutOrNull(1300L) {
        repeat(1000) { i ->
            println("I'm sleeping $i ...")
            delay(500L)
        }
        "Done" // will get cancelled before it produces this result
    }
    println("Result is $result")
}
```

위의 코드를 실행해 보면 `Result is null` 이 출력될 것이다.

<br>

## Asynchronous timeout and resources

`withTimeout` 은 해당 블록에서 실행 중인 코드에 대해 비동기로 처리되며, 내부 블록이 반환되기 직전 어디에서든 발생할 수 있다. 블록 내부에서 수정 중인 리소스를 외부에서 사용할 경우 이를 염두하여 코드를 작성해야 한다.

```kotlin
var acquired = 0

class Resource {
    init { acquired++ } // Acquire the resource
    fun close() { acquired-- } // Release the resource
}

fun main() {
    runBlocking {
        repeat(100_000) { // Launch 100K coroutines
            launch { 
                val resource = withTimeout(60) { // Timeout of 60 ms
                    delay(50) // Delay for 50 ms
                    Resource() // Acquire a resource and return it from withTimeout block     
                }
                resource.close() // Release the resource
            }
        }
    }
    // Outside of runBlocking all coroutines have completed
    println(acquired) // Print the number of resources still acquired
}
```

컴퓨터 상황이나 사양에 따라 위 코드 결과가 0이 될 수도, 0이 아닐 수도 있다. 그러나 실제로 이 코드에서 0이 아닌 값을 보기 위해서는 예제의 시간을 조정해야 할 것이다.

이 문제를 해결하기 위해 `withTimeout` 블록에서 return하는 것과 반대로 리소스에 대한 참조를 변수에 저장해둘 수 있다.

```kotlin
var acquired = 0

class Resource {
    init { acquired++ } // Acquire the resource
    fun close() { acquired-- } // Release the resource
}

fun main() {
    runBlocking {
        repeat(100_000) { // Launch 100K coroutines
            launch { 
                var resource: Resource? = null // Not acquired yet
                try {
                    withTimeout(60) { // Timeout of 60 ms
                        delay(50) // Delay for 50 ms
                        resource = Resource() // Store a resource to the variable if acquired      
                    }
                    // We can do something else with the resource here
                } finally {  
                    resource?.close() // Release the resource if it was acquired
                }
            }
        }
    }
    // Outside of runBlocking all coroutines have completed
    println(acquired) // Print the number of resources still acquired
}
```

위 코드는 항상 0을 반환한다.

좀 쉽게 풀어서 쓰자면, 외부 리소스를 코루틴 안에서 사용할 때

1. 리소스 참조 변수를 선언
2. `finally` 에서 리소스 해제

이 두 가지를 기억하면 좋을 것이다.

<br>

# 참고

- [코루틴 공식 문서 - Cancellation and Timeouts](https://kotlinlang.org/docs/reference/coroutines/cancellation-and-timeouts.html)
- [새차원의 코틀린 코루틴 강좌 #3 - Cancellation and Timeouts](https://youtu.be/GmVv98LUa0k)

<br>