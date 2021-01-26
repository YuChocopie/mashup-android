---
title: Corotuine Composing Suspending Functions
date: "2021-01-18"
tags: ["coroutine", "mash-up", "dahyun","Android","study"]
description: "Corotuine Composing Suspending Functions에 대해 알아봅시다."
cover: "./coroutine3rdcover.png"
---

# **Corotuine Composing Suspending Functions**

안녕하세요 안드로이드 10기 강다현입니다.

이번에 알아볼 내용은 **Corotuine의 세 번째 스터디 내용 Composing Suspending Functions** 입니다!

코틀린 스터디는 한 주에 두 개씩 공식 문서를 같이 보면서 진행되는데요, 저는 그 중 스터디 두 번째 주에서 Composing Suspending Functions 파트의 발표를 맡았었습니다.

본 글에서는 이전 주에서 헷갈렸던 내용 3가지를 보고, 그 이후 세 번째 파트 스터디 내용인 Composing Suspending Functions에 대해 알아보겠습니다!

[공식 문서](https://kotlinlang.org/docs/reference/coroutines/composing-suspending-functions.html)

___

# 헷갈렸던 것들

저는 공식문서 1,2 파트에서 3가지가 헷갈렸는데요, 하나하나 살펴보도록 하겠습니다.

## 1. 코루틴 생성시 자동 생성되는 스레드

<p align="center">
<img src="1.png" width="100%">
<br>자동 생성되는 스레드<br/></img></p>

코루틴을 생성하다보면 스레드가 자동 생성되기도 합니다. 스레드를 생성해서 바꾸면 컨텍스트 스위칭 비용이 들기에 왜 굳이 스레드가 생성되는지 궁금했어요. 그런 비용 부분을 완화하기 위해 코루틴을 쓰기도 하니까요. 

왜 이런지 궁금해서 찾아보니 (어느정도 추측에 따르면...!), 돌리는 컴퓨터의 코어의 갯수와 상관이 있었습니다. 코어는 아예 병행으로 스레드들을 돌리게 되니, 컨텍스트 스위칭 비용이 발생하지 않겠죠? 그래서 코어로 병행성 이득을 볼 수 있는 정도까지만 스레드를 생성한다고 합니다. 

보통 코어 갯수인데, 인텔에서는 하이퍼스레딩을 쓰기도 하더라고요. 저의 경우 맥북에서 코어 6개에 하이퍼스레딩으로 2배가 되어 디폴트 스레드들에서 12개의 스레드들이 추가가 되었습니다. 참고하시면 좋을 것 같습니다! 제 기억에는 예전에 rxjava 스터디 할때도 이와 비슷한 경우가 있었던 것 같네요!

## 2. corotineScope, launch의 차이

이건 해결되지 않은 문제였습니다.

<p align="center">
<img src="2.png" width="100%">
<br>순서의 문제<br/></img></p>

여기서 기본적으로 launch로 생성되는 코루틴은 따로 큐에 들어가는 (실제로 큐에 들어가는건 아니라고 합니다..? 이 부분도 쉽지 않더라고요) 느낌으로 생성되고, 밖에 있는 코루틴 블록이 다 돌면 (코드를 다 보면) 큐에 있던 launch가 실행됩니다. 근데 그러는 와중에 coroutinescope가 실행되면? launch의 큐에 있던 코루틴들이 다 실행됩니다.

이게 방식은 이해가 되는데 왜 그런지 이유를 도저히 모르겠습니다... 아직 그래서 미해결이구요.

참고하면 좋을 스택오버플로우 글입니다.

[https://stackoverflow.com/questions/53535977/coroutines-runblocking-vs-coroutinescope](https://stackoverflow.com/questions/53535977/coroutines-runblocking-vs-coroutinescope)

스택오버플로우에 따로 한 번 질문을 올려보고 결과가 나오면 글에 반영하겠습니다!

### 관련 퀴즈(조금 과합니다ㅎㅎ) 

다음 코드의 결과를 예상해보세요!

~~~kotlin
@Test
    fun coroutineTest() = runBlocking {
        launch {
            println(1)
            delay(2000)
            launch {
                println(2)
                delay(1000)
            }
            coroutineScope {
                launch {
                    println(3)
                }
                delay(1000)
                println(4)
            }
            launch {
                delay(1000)
                println(5)
            }
            println(6)
            coroutineScope {
                println(7)
            }
            println(8)
            delay(1000)
            coroutineScope {
                println(9)
            }
            println(10)
        }
        println(11)
    }
~~~

결과는 다음과 같습니다. 바로 맞히셨을까요?

~~~kotlin
11
1
2
3
4
6
7
8
9
10
5
~~~

## 3. 공식 페이지 코드가 잘 돌아가지 않던 문제

잘 돌아가지 않는다...라기보다는 원하는 대로 결과가 안나오는 문제..? 라고 할 수 있겠네요.

~~~kotlin
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
~~~

공식 문서에서는 0이외의 값이 나온다고 하는데, 저는 도통 0만 나오더라고요.

이것 때문에 시간을 좀 허비했는데, delay 함수만 없애도 0이 안나옵니다.

delay를 포함한 Resource 생성 시간이 timeout 60초를 넘어서 생기는 문제인 것 같아요.

혹시 돌려보실 분들은 참고하면 좋을 것 같습니다!

# Composing Suspending Functions

복습을 마치고 이제 본격적으로 Composing Suspending Functions에 대해 알아봅시다! 

이 챕터에서는 suspending function 구성에 대한 다양한 접근방법을 다룹니다.

suspend fun은 기본적으로 순차적으로 진행됩니다.

~~~kotlin
suspend fun doSomethingUsefulOne(): Int {
    delay(1000L) // pretend we are doing something useful here
		return 13
}

suspend fun doSomethingUsefulTwo(): Int {
    delay(1000L) // pretend we are doing something useful here, too
		return 29
}
~~~

~~~kotlin
val time = measureTimeMillis {
    val one = doSomethingUsefulOne()
    val two = doSomethingUsefulTwo()
    println("The answer is ${one + two}")
}
println("Completed in $time ms")
~~~
~~~kotlin
The answer is 42
Completed in 2017 ms
~~~

이 결과는 당연해보이죠? 그냥 순차적으로 진행되었습니다!

### Concurrent using async

~~~kotlin
val time = measureTimeMillis {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
	delay(1000)
    println("The answer is ${one.await() + two.await()}")
}
println("Completed in $time ms")
~~~
~~~kotlin
The answer is 42
Completed in 1017 ms
~~~

`async`를 사용해 보았습니다. 여기서 중요한 것은 (스터디에서 꽤나 토론을 했었죠!) `async`를 하면 바로 실행이 된다는 점입니다! `await()`를 해야 실행되는게 아닙니다! 

async의 반환값인 Deferred도 Job이기 때문에 cancel할 수 있다는 점을 생각합니다!

바로 실행되기만 하면 안되겠죠!
~~~kotlin
val time = measureTimeMillis {
    val one = async(start = CoroutineStart.LAZY) { doSomethingUsefulOne() }
    val two = async(start = CoroutineStart.LAZY) { doSomethingUsefulTwo() }
    // some computation

    one.start() // start the first one
    two.start() // start the second one
		//delay(1000)
    println("The answer is ${one.await() + two.await()}")
}
println("Completed in $time ms")
~~~
~~~kotlin
The answer is 42
Completed in 1017 ms
~~~

`(start = CoroutineStart.LAZY)`옵션을 넣으면 start까지 실행을 늦출 수 있습니다! 

이 때 start를 안넣으면 await()를 순차적으로 진행하게 됩니다! 이 부분을 조심해야 하는데요, one.await()를 진행할 때 two.await()가 진행되지 않습니다! one.await()가 시작하고 끝날때까지 기다려주기도 하기 때문입니다.

### Async-style functions

~~~kotlin
// The result type of somethingUsefulOneAsync is Deferred<Int>
fun somethingUsefulOneAsync() = GlobalScope.async {
    doSomethingUsefulOne()
}

// The result type of somethingUsefulTwoAsync is Deferred<Int>
fun somethingUsefulTwoAsync() = GlobalScope.async {
    doSomethingUsefulTwo()
}
~~~
~~~kotlin
// note that we don't have `runBlocking` to the right of `main` in this example
fun main() {
    val time = measureTimeMillis {
        // we can initiate async actions outside of a coroutine
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
~~~

다른 프로그래밍 언어에서 자주 사용하는 방식의 코드입니다. Async 접미사로 비동기 계산을 할 수 있다는 점과 `Deferred`값을 반환한다는 점을 을 잘 나타낼 수 있습니다.

그러나 코드를 자세히 보면 이건 사실 코틀린에서 추천되는 방식이 아닙니다. 공식 문서에는 `strongly discouraged`라고 까지 표현합니다. 왜냐하면 `val one = somethingUsefulOneAsync()`와 `one.await()` 사이에 에러가 난다고 해도 `somethingUsefulOneAsync()`은 그냥 그대로 계속 돌아가기 때문입니다.  operation이 aborted된다고 해도 말이죠. 이러한 문제를 해결하려면 어떻게 해야 할까요? 아래에서 소개하는 Structured concurrency with async 방식으로 해결이 가능합니다.

### Structured concurrency with async

코틀린스러운 코루틴의 올바른 방식은 무엇일까요?

~~~kotlin
suspend fun concurrentSum(): Int = coroutineScope {
    val one = async { doSomethingUsefulOne() }
    val two = async { doSomethingUsefulTwo() }
    one.await() + two.await()
}

fun main() = runBlocking<Unit> {
    val time = measureTimeMillis {
        println("The answer is ${concurrentSum()}")
    }
    println("Completed in $time ms")    
}
~~~
~~~kotlin
import kotlinx.coroutines.*

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
~~~
~~~kotlin
Second child throws an exception
First child was cancelled
Computation failed with ArithmeticException
~~~

이런식으로 묶어주듯이 사용하면 됩니다. 위에서 나온 문제를 해결할 수 있습니다! 문제가 생긴 스코프 전체를 취소해버리기 때문이죠. error를 강제적으로 한 곳에서 던져주면 다른 코루틴도 취소가 됨을 볼 수 있습니다.

___

이상 코루틴 Composing Suspending Functions에 대해 알아보았습니다.

혹시나 잘못된 내용이라고 생각되는 부분, 잘 모르겠다고 생각되시는 부분이 있으시면 알려주세요ㅎㅎ