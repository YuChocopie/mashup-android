---

title: "Coroutine Cancellation and Timeouts"

date: "2021-01-15"

tags: ["coroutine-study", "1주차 스터디", "coroutine-calcellation", "coroutine-timeouts"]

description: "1주차 코루틴 스터디 : Coroutine Cancellation and Timeouts"

cover: "./coroutine_cancellation.png"

---

# 코루틴 Basic 2장. Cancellation and Timeouts

### 코루틴 실행 취소하기

아래의 코드는 job을 생성하고 취소 시키는 코드입니다

```kotlin
val job = launch {
	repeat(1000) { i ->
		println("job: I'm sleeping $i ...")
		delay(500L)
	}
}
delay(1300L)
println("main: I'm tired of waiting!")
job.cancel() // job을 취소한다
job.join() // job이 완료되기를 기다린다
println("main: Now I can quit.")
```

- 결과

    ```kotlin
    job: I'm sleeping 0 ...
    job: I'm sleeping 1 ...
    job: I'm sleeping 2 ...
    main: I'm tired of waiting!
    main: Now I can quit.
    ```

launch (coruotine builder)를 통해 coroutine을 작성하면 job이 반환됩니다. 반환된 job을 통해 cancel 혹은 join을 실행할 수 있습니다. cancel과 join을 한 번에 처리하기 위함 cancleAndJob이라는 확장함수 또한 지원합니다.

## 취소는 협력적이어야(보장되어야) 한다 Cooperative

- 코루틴 취소는 협렵적이어야 합니다. 코루틴 코드는 항상 취소할 수 있게 작성되어야 합니다. 모든 suspending function은 cancellable입니다. 이들은 코루틴이 취소가능한지 체크를 해야 하며 캔슬이 될 때 CancellationException을 throw 합니다. 그러나 코루틴이 계속 계산을 하는 중이며, 취소가능한지 체크를 하지 않으면 이는 취소될 수 없습니다.

아래의 코드는 계산을 무한정 반복하는 job을 생성하고 이를 취소시키는 코드입니다.

```kotlin
val startTime = System.currentTimeMillis()
val job = launch(Dispatchers.Default) {
    var nextPrintTime = startTime
    var i = 0
    while (i < 5) { // CPU를 낭비시키기 위한 computation loop
        // 1s에 2번 message 출력
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
```

- 결과

    job: I'm sleeping 0 ...
    job: I'm sleeping 1 ...
    job: I'm sleeping 2 ...
    main: I'm tired of waiting!
    job: I'm sleeping 3 ...
    job: I'm sleeping 4 ...
    main: Now I can quit.

결과를 보면 job.cancelAndJoin()을 통해 job이 cancel이 되지 않고 계속해서 job이 실행되는점을 볼 수 있습니다.

위의 job은 취소가능한 상태를 확인하지 않고 계속해서 계산을 진행중이기에 취소가 될 수 없습니다.

- 여기서 잠깐!

    delay() 함수는 cancellable suspending function 이기때문에 개발자가 별도의 cancellable를 확인하는 작업이 없어도 취소가 가능합니다.

## 취소가능한 계산코드를 만들어보자

- computation code를 취소하는 방법으로는 2가지가 있습니다.
    1. yield() 함수를 매번 call 하여 취소가능한 상태인지 확인하기
    2. 명시적으로 취소 상태를 확인하기

1번의 방식으로 만든 계산코드

```kotlin
val startTime = System.currentTimeMillis()
val job = launch(Dispatchers.Default) {
    var nextPrintTime = startTime
    var i = 0
    while (i < 5) { // cancellable computation loop
        // print a message twice a second
				yield()
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
```

2번의 방식으로 만든 계산코드

```kotlin
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
```

- 결과

    job: I'm sleeping 0 ...
    job: I'm sleeping 1 ...
    job: I'm sleeping 2 ...
    main: I'm tired of waiting!
    main: Now I can quit.

yield 및 isActive는 CoroutineScope을 통해 코루틴 내에서 사용가능합니다

## finally를 사용해 리소스를 닫아보자

- 취소가능한 suspending function은 취소될때 CancellationException을 throw한다고 했으니 try, catch, finally를 통해 이를 처리할 수 있습니다. Kotlin의 use 함수는 코루틴이 취소될 때 마무리 작업을 실행합니다

아래의 코드는 finally를 사용해 리소스를 close 하는 코드입니다

```kotlin
val job = launch {
    try {
        repeat(1000) { i ->
            println("job: I'm sleeping $i ...")
            delay(500L)
        }
    } finally {
        println("job: I'm running finally")
    }
}
delay(1300L) // delay a bit
println("main: I'm tired of waiting!")
job.cancelAndJoin() // cancels the job and waits for its completion
println("main: Now I can quit.")
```

- 결과

    job: I'm sleeping 0 ...
    job: I'm sleeping 1 ...
    job: I'm sleeping 2 ...
    main: I'm tired of waiting!
    job: I'm running finally
    main: Now I can quit.

정상적으로 취소가 되는걸 볼 수 있습니다. 취소가 된 후 finally안에 작성된 코드도 정상적으로 출력됩니다. cancelAndJoin 혹은 join 함수는 마무리작업이 완료되기까지 기다립니다.

## non-cancellable block을 실행시켜보자

- 위 예제에서 finally 블록 안에서 suspending function을 실행시키고자 하면 코드를 실행하는 코루틴이 취소되었기 때문에 CancellationException이 발생합니다. 일반적인 상황에서는 finally 안에서 suspending function을 포함하지 않기에 별 문제될 게 없습니다. 그러나 가끔 finally 내에서 suspending function을 포함해야 하는 경우 withContext함수와 NonCancellable 컨텍스트를 사용하여 해당 코드를 래핑할 수 있습니다.

아래의 코드는 withContext(NonCancellable)를 통해 취소불가능한 블록을 실행시키는 예제입니다

```kotlin
val job = launch {
    try {
        repeat(1000) { i ->
            println("job: I'm sleeping $i ...")
            delay(500L)
        }
    } finally {
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
```

- 결과

    job: I'm sleeping 0 ...
    job: I'm sleeping 1 ...
    job: I'm sleeping 2 ...
    main: I'm tired of waiting!
    job: I'm running finally
    job: And I've just delayed for 1 sec because I'm non-cancellable
    main: Now I can quit.

## Timeout

아래의 코드는 withTimeout을 통해 실행시간이 제한된 코루틴이 제한된 시간을 초과하는 코드입니다

```kotlin
withTimeout(1300L) {
    repeat(1000) { i ->
        println("I'm sleeping $i ...")
        delay(500L)
    }
}
```

- 결과

    I'm sleeping 0 ...
    I'm sleeping 1 ...
    I'm sleeping 2 ...
    Exception in thread "main" kotlinx.coroutines.TimeoutCancellationException: Timed out waiting for 1300 ms

결과에서 발생한 TimeoutCancellationException은 CancellationException의 서브 클래스이며 메인 함수 내부에서 withTimeout을 사용하여 stack trace가 출력되었습니다

해당 예외를 처리하는 방법은 2가지가 있습니다

1. try-catch를 통해 예외처리
2. withTimeoutOrNull 함수를 통해 예외를 throw하는 대신 null를 return 받기

아래의 코드는 1번의 방식으로 예외를 처리한 코드입니다

```kotlin
runBlocking {
            val result = try {
                withTimeout(1300L) {
                    repeat(1000) { i ->
                        println("I'm sleeping $i ...")
                        delay(500L)
                    }
                    "Done" // will get cancelled before it produces this result
                }
            } catch (e: TimeoutCancellationException) {
                "Cancel"
            }
            println("Result is $result")
        }
```

- 결과

    I'm sleeping 0 ...
    I'm sleeping 1 ...
    I'm sleeping 2 ...
    Result is Cancel

아래의 코드는 2번의 방식으로 예외를 처리한 코드입니다

```kotlin
val result = withTimeoutOrNull(1300L) {
    repeat(1000) { i ->
        println("I'm sleeping $i ...")
        delay(500L)
    }
    "Done" // will get cancelled before it produces this result
}
println("Result is $result")
```

- 결과

    I'm sleeping 0 ...
    I'm sleeping 1 ...
    I'm sleeping 2 ...
    Result is null

## 비동기 타임아웃과 리소스

- withTimeout을 통한 타임아웃 이벤트는 code가 해당 block 내에서 실행되는 동안에 언제든지 발생할 수 있기 때문에 리소스를 처리할 때에 이를 해제해주거나 닫아야 할 때 이에 대한 처리가 필요합니다.

아래의 코드는 withTimeout 내부에서 Resource를 취득 및 해제를 여러번 반복하는 코드입니다. acquired가 어떻게 변하는지를 중점으로 살펴봐주세요

```kotlin
var acquired = 0

class Resource {
    init { acquired++ } // Acquire the resource
    fun close() { acquired-- } // Release the resource
}

fun main() {
    runBlocking { -> main Thread (scope)
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

- 결과

    0 ~ 100,000 사이의 random한 value

결과를 살펴보니 항상 0이 출력되지 않은걸 볼 수 있습니다. 

> 위의 코루틴은 완벽하게 안전합니다. 위의 코루틴은 항상 같은 main thread 에서 실행됩니다. 이에 대한 자세한 설명은 coroutine context의 chapter에 있습니다.

위의 문제를 해결하는 방법으로는 withTimeout 블록에서 리턴시키는 것이 아닌 resource의 참조를 변수에 저장는 방식으로 해결할 수 있습니다.

```kotlin
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
```

- 결과

    0

위의 결과는 항상 0을 출력합니다. 리소스는 누수되지 않습니다!
