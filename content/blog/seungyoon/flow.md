---
title: "Coroutine Flow"
date: "2021-01-26"
tags:
  ["mash-up", "seungyoon", "coroutine", "flow"]
description: "코루틴 flow에 대해 알아보자."
cover: "flow/Group 3.jpg"
---

<br>
<img src="flow/flow.png" width="500">
</br>

---

#### **Asynchronous Flow**

**suspending** function은 **비동기**로 **단일값**을 반환하는 반면,

**Flow**는 **비동기**로 동작하면서 **여러 개의 값을 반환**하는 function을 만들 때 사용하는 coroutine builder입니다.

-   flow {}로 생성된 block은 suspend 할 수 있습니다.
-   flow 역시 builder 이기 때문에 suspend 키워드 없이 함수를 만들 수 있습니다.
-   **emit** 함수를 이용해 값들을 방출합니다.
-   **collect**함수를 이용해 방출된 값들을 수집합니다.

> code

```kotlin
fun foo() = flow {
    for(i in 1..3) {
        delay(100)
        emit(i)
    }
}

fun main() = runBlocking {
    val startTime = System.currentTimeMillis()

    println("main start!")
    launch {
        for(k in 1..3) {
            println("I'm not blocked $k")
            delay(100)
        }
    }

    foo().collect {
        println("receive $it after ${System.currentTimeMillis() - startTime}ms")
    }
    println("main end!")
}

```

> result

```kotlin
main start!
I'm not blocked 1
receive 1 after 116ms
I'm not blocked 2
receive 2 after 220ms
I'm not blocked 3
receive 3 after 322ms
main end!
```

main thread가 blocking 되는지를 판단하기 위해 먼저 launch를 하나 띄워놓고 foo() 함수를 실행합니다.

launch 내부의 print문이 중간중간 찍히기 때문에 thread가 blocking 되지 않았음을 확인할 수 있습니다.

**List<Int>를 함수의 반환 타입으로 사용한다는 것은 모든 계산이 끝난 후에 한 번에 결과를 반환하는 것을 의미합니다.**

**하지만, 비동기적으로 계산하면서 계산이 끝날 때마다 하나씩 stream 형태로 값을 전달할 때 flow를 사용합니다.**

만약 foo() 함수에서 Thread.sleep을 사용하면 어떻게 될까요?

> code 

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()

    println("main start!")
    launch {
        for (k in 1..3) {
            println("I'm not blocked $k")
            delay(100)
        }
    }

    foo().forEach {
        println("receive $it after ${System.currentTimeMillis() - startTime}ms")
    }
    println("main end!")

}

fun foo() = sequence {
    for (i in 1..3) {
        Thread.sleep(100)
        yield(i)
    }
}
```

> **result**

```kotlin
main start!
receive 1 after 107ms
receive 2 after 208ms
receive 3 after 313ms
main end!
I'm not blocked 1
I'm not blocked 2
I'm not blocked 3
```

Thread.sleep으로 인해 **main thread**가 **block** 되면서 launch 내부 구문이 돌지 못합니다.

foo() 함수가 끝나고 나서야 한 번에 도는 걸 확인할 수 있습니다.

**Thread의 blocking과 상관없이 collect를 만나면 collect 함수가 종료될 때까지 해당 코드라인을 넘어가지는 않습니다.**

**(Thread blocking은 아니지만, 코루틴의 기본 원칙인 순차적 동작을 만족한다고 합니다.)**

---

#### **Flows are cold**

일반적으로 flow는 Sequence와 유사하게 **cold stream**입니다. ([SharedFlow](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/index.html)하위 타입은**hot stream**을 나타냅니다.)

따라서 내부의 코드 블록은 flow가 **collect** 호출되기 전까지는 수행되지 않습니다. 

> code

```kotlin
fun main() = runBlocking {
    println("Calling foo..")
    val flow = foo()
    println("Calling collect..")
    flow.collect { value -> println(value) }
    println("Calling collect again..")
    flow.collect { value -> println(value) }
}

fun foo() = flow {
    println("Flow started")
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}
```

> result

```kotlin
Calling foo..
Calling collect..
Flow started
1
2
3
Calling collect again..
Flow started
1
2
3
```

**flow**는 **소모성이 아니기 때문에** collect를 호출할 때마다 다시 시작됩니다.

즉 flow를 반환하는 foo() 함수가 **suspend** 키워드로 표시되지 않는 핵심적인 이유입니다.

foo() 함수는 호출 시 바로 반환되며 그 무엇도 기다리지 않습니다.

또한 호출할 때마다 처음부터 값을 전부 방출합니다.

그래서 collect를 부를 때마다 _"Flow started"가_ 찍힙니다.

---

#### **Flow cancellation**

**flow**는 일반적인 코루틴의 cancel 로직을 따릅니다. (launch나 async 같은 다른 builder의 cancel 동작과 동일합니다.)

flow 내부에 delay 같은 suspending function을 만났을 때 cancel 되며,

CPU를 계속 점유하거나 소비하는 연속적인 작업 같은 경우에는 취소되지 않습니다.

**flow 자체에는 cancel 함수를 지원하지 않습니다.**

따라서 아래와 같이 **timer**로 종료시키거나 **launch**로 감싸서 취소해야 합니다.

> code

```kotlin
fun main() = runBlocking {
    println("main start!")
    withTimeoutOrNull(250) {
        foo().collect { value -> println(value) }
    }
    println("main end!")
}

fun foo() = flow {
    for (i in 1..3) {
        delay(100)
        println("Emitting $i")
        emit(i)
    }
}
```

```kotlin
fun main() = runBlocking {
    println("main start!")

    val fooLaunch = launch {
        foo().collect { value -> println(value) }
    }
    delay(250)
    fooLaunch.cancel()
    println("main end!")
}
```

> result

```kotlin
main start!
Emitting 1
1
Emitting 2
2
main end!
```

---

#### **Flow builders**

**flow{ }**를 이용해서 flow를 만드는 건 가장 기본적인 방법입니다.

다음과 같은 형태로 flow를 만들 수 있습니다.

-   값이 고정되어 있을 경우 **flowOf** builder 사용.
-   다양한 Collection들과 Sequence들을 **.asFlow()** extension function를 통해 flow로 변환 가능.

> code

```kotlin
fun main() = runBlocking {
    println("main start!")

    val flow = flowOf(1, 2, 3)
    flow.collect { value -> println("flow: $value") }

    println("-------------------")
    
    (1..3).asFlow().collect { value -> println("flow:$value") }
    
    println("main end!")
}
```

> result

```kotlin
main start!
flow: 1
flow: 2
flow: 3
-------------------
flow:1
flow:2
flow:3
main end!
```

---

### **Intermediate flow operator**

**flow**는 **collection**이나 **sequence**처럼 **중간 연산자**로 변환할 수 있으며, 중간 연산자는 flow의 기본 동작과 같이 cold 하게 동작합니다.

이런 중간 연산자들은 **suspend function**은 아니지만, 빠르게 동작하여 새로운 flow를 반환합니다.

>  code

```kotlin
fun main() = runBlocking {
    (1..3).asFlow()
            .map { request -> performRequest(request) }
            .collect { response -> println(response) }
}

suspend fun performRequest(request: Int): String {
    delay(1000)
    return "response $request"
}
```

> result

```kotlin
response 1
response 2
response 3
```

일반적으로 Collection이나 Sequence에서 사용하는 map이나 filter를 flow에서도 사용 가능합니다.

flow에서 사용되는 중간 연산자 블록 안에서는 **suspending function**을 사용할 수 있다는 점이 Collection, sequence와 가장 큰 **차이점**입니다.

---

#### **Transfrom operator**

flow의 변환 연산자 중에 가장 일반적인 것 중 하나가 **transform** 연산자입니다.

이것은 map이나 filter 같은 중간 연산자처럼 간단하게 값들을 변환할 수 있고, 복잡한 변환을 수행할 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    (1..3).asFlow()
            .transform { request ->
                emit("Making request $request")
                emit(performRequest(request))
            }
            .collect { response -> println(response) }
}

suspend fun performRequest(request: Int): String {
    delay(1000)
    return "response $request"
}
```

> result

```kotlin
Making request 1
response 1
Making request 2
response 2
Making request 3
response 3
```

**transform** 연산자를 이용해서 임의의 값을 여러 번 방출할 수 있습니다.

하나의 원소당 두 번 emit 하도록 하는 코드입니다. emit 한 순서에 맞게 순차적으로 방출됩니다.

---

#### **Size-limiting operator**

**flow**는 연속적인 값들의 **stream**을 **asynchronous** 하게 반환하는 builder입니다.

제한된 개수만 처리가 필요할 경우 **take**를 사용해서 처리 가능합니다.

take는 제한된 개수까지 수행하고 그 이후에는 **cancel** 시킵니다.

> code

```kotlin
fun main() = runBlocking {
    numbers()
            .take(2)
            .collect { value -> println(value) }
}

fun numbers() = flow {
    try {
        emit(1)
        emit(2)
        println("여기부터 수행되지 않을겁니다.")
        emit(3)
    } finally {
        println("마무리")
    }
}
```

> result

```kotlin
1
2
마무리
```

---

#### **Terminal flow operators**

**Terminal operator**는 collection을 시작시키는 **suspending function**입니다.

**collect**는 가장 기본적인 operator이고 그 외에도 다양한 operator들이 있습니다.

-   **toList** 또는 **toSet** - flow를 MutableList나 MutableSet으로 변환
-   **first** - 첫 번째 원소를 반환하고 나머지는 cancel 시킴
-   **reduce** - 첫 번째 원소에 주어진 operation을 이용하여 누적시켜 최종 값을 반환

> code

```kotlin
fun main() = runBlocking {
    val sum = (1..5).asFlow()
            .map { it * it }
            .reduce { a, b -> a + b }
    println(sum)
}
```

> result

```kotlin
55
```

---

#### **Flows are sequential**

각각의 collection으로 이루어진 flow들은 특별하게 multiple flow로 동작하도록 하는 특별한 연산자를 사용하지 않는 이상

**순차적**으로 동작합니다.

기본적으로 terminal operator를 호출하는 coroutine에서 바로 수행되며, 새로운 코루틴을 생성해서 사용하지 않습니다.

> code

```kotlin
fun main() = runBlocking {
    (1..5).asFlow()
            .filter {
                println("Filter $it")
                it % 2 == 0
            }
            .map { 
                println("Map $it")
                "string $it"
            }.collect {
                println("Collect $it")
            }
}
```

> result

```kotlin
Filter 1
Filter 2
Map 2
Collect string 2
Filter 3
Filter 4
Map 4
Collect string 4
Filter 5
```

---


#### **Flow context**

flow로 만들어진 collection은 항상 이를 호출한 **coroutine context**에서 수행됩니다.

즉 **flow**는 **context 보존 특성**을 가지고 있습니다.이를 **context preservation**이라 부릅니다.

> code

```kotlin
fun main() = runBlocking {
    foo().collect { value -> log("Collected $value") }
}

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")

fun foo() = flow {
    log("Started foo flow")
    for (i in 1..3) {
        emit(i)
    
```

> result

```kotlin
[main] Started foo flow
[main] Collected 1
[main] Collected 2
[main] Collected 3
```

collect()를 호출한 **코루틴의 context**는 **main thread**를 사용하고 있기 때문에

flow의 body 영역의 코드 역시 main thread에서 처리됩니다.

---

#### **Wrong emission withContext**

보통 **CPU**를 많이 소모하는 작업이라면 **Dispatchers.Default**와 같은 **background thread**에서 수행하고,

이 결과를 받아 **UI 업데이트하는** 작업은 **Dispatchers.Main**과 같은 **main thread**에서 수행될 필요가 있습니다.

코루틴에서는 **context switching**을 **withContext**를 이용하여 쉽게 전환 가능합니다.

> code

```kotlin
fun main() = runBlocking {
    foo().collect { value -> println(value) }
}

fun foo() = flow {
    withContext(Dispatchers.Default) {
        for (i in 1..3) {
            Thread.sleep(100)
            emit(i)
        }
    }
}
```

위의 예제는 **context preservation** 속성 때문에 emit 하는 context와 수신하는 context를 다르게 하지 못하도록 되어 있습니다.

---

#### **flowOn operator**

flow의 context를 변경하는 유일한 방법은 upstream context를 변경하는 **flowOn** operator를 사용하는 것입니다.

이를 통해 emit 하는 부분의 context를 바꿔줄 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    println("main start!")
    foo().collect { log("Collected $it") }
    println("main end!")
}

fun foo() = flow {
    for (i in 1..3) {
        Thread.sleep(100)
        log("Emitting $i")
        emit(i)
    }
}.flowOn(Dispatchers.Default)

fun log(msg: String) = println("[${Thread.currentThread().name}] $msg")
```

> result

```kotlin
main start!
[DefaultDispatcher-worker-1] Emitting 1
[main] Collected 1
[DefaultDispatcher-worker-1] Emitting 2
[main] Collected 2
[DefaultDispatcher-worker-1] Emitting 3
[main] Collected 3
main end!
```

**메인 스레드**에서 수집 연산을 수행할 때 flow {..}가 백그라운드 스레드에서 동작하는 모습을 확인할 수 있습니다.

**flowOn** operator를 사용함으로써 하나의 코루틴이 emissions과 collection을 **순차적**으로 처리하던 것을

emission과 collection이 각각 코루틴에서 **동시에** 진행하게 됩니다.

---

#### **Buffering**

기본적으로 flow는 [**produce and consumer pattern**](https://ko.wikipedia.org/wiki/생산자-소비자_문제)입니다.

만약 값을 생산하는 입장과 소비하는 입장에서 한 쪽 또는 양쪽 모두 느리다면 

**두 부분을 분리**해서 처리하는 코루틴은 전체 처리 시간을 감소시키는 효과를 낼 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    val time = measureTimeMillis {
        foo().collect { value->
            delay(300)
            println(value)
        }
    }
    println("Collected in $time ms")
}

fun foo() = flow {
    for(i in 1..3) {
        delay(100)
        emit(i)
    }
}
```

> result

```kotlin
1
2
3
Collected in 1220 ms
```

값을 emit 하는데 0.1초, 처리하는데 0.3초가 걸려 각 원소당 총 0.4초가 소요됩니다.

그래서 총 1.2초가 걸립니다.

값을 생산하는 쪽과 소비하는 쪽을 **분리**해서 처리한다면 총 시간을 감소시킬 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    val time = measureTimeMillis {
        foo()
                .buffer()
                .collect { value ->
                    delay(300)
                    println(value)
                }
    }
    println("Collected in $time ms")
}

fun foo() = flow {
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}
```

collect 앞에 **buffer()**를 달아서 processing pipeline을 만들면 좀 더 효율적으로 동작 가능합니다. 

> result

```kotlin
1
2
3
Collected in 1048 ms
```

**데이터를 미리 생산해서 버퍼에 담아두고 바로 사용하기에 실행시간에 불필요한 딜레이가 사라집니다.**

처음 데이터가 방출되는데 0.1초가 걸리고 출력하는데 0.3초 \* 원소의 개수(3개) = 총 1초의 시간이 걸렸습니다.

즉 **emit()** 과 **collect()** 을 순차적인 처리가 아닌 별개의 코루틴에서  [pipelining](https://yoon-dailylife.tistory.com/64)을 통해 **동시에** 동작하도록 하여 시간을 감소시켰습니다.

---

#### **Conflation**

flow는 연속적으로 값을 처리하여 방출합니다.

만약 처리하는 값이 중간값이거나, 어떤 상태의 업데이트 값이라면 **마지막 최신 값만** 의미 있는 값이라 볼 수 있습니다.

**conflate** operator를 사용하여 중간값은 skip 하고 마지막 값만 취할 수 있습니다.


> code

```kotlin
fun main() = runBlocking {
    val time = measureTimeMillis {
        foo()
                .conflate()
                .collect { value ->
                    delay(300)
                    println("collect $value")
                }
    }
    println("Collected in $time ms")
}

fun foo() = flow {
    for (i in 1..3) {
        delay(100)
        emit(i)
        println("emit $i")
    }
}
```

> result

```kotlin
emit 1
emit 2
emit 3
collect 1
collect 3
Collected in 747 ms
```

**conflate**는 **buffer**와 마찬가지로 **방출**과 **수집**을 **다른 코루틴**에서 동작하게 합니다.

**buffer**와 **다른 점**은 모든 데이터를 버퍼에 넣어두고 쌓여있는 값을 하나씩 처리하는게 아니라, 중간 값은 모두 버리고

마지막 **최신 데이터만** 전달합니다.

처음 수가 여전히 처리중인데 2, 3번째 수가 방출됨을 확인할 수 있습니다.

그래서 2번째 수는 스킵되고 가장 최근 값인 3번째 값이 수집기로 전달됩니다.

---

#### **Processing the latest value**

**conflation**은 emit과 collect 둘 다 느린 경우 emit 된 값을 버림으로써 처리 속도를 높이는 데 사용합니다.

**collectLatest()** operator를 사용하면 collect 동작 중 새로운 값이 emit 되어 전달받으면 기존 collect 동작을 취소하고,

새로운 값을 위한 collect를 재시작시킵니다. **즉 기존 동작을 취소하고 최근 값을 처리합니다.**

> code

```kotlin
fun main() = runBlocking {
    println("main start!")
    val time = measureTimeMillis {
        foo().collectLatest { value ->
            try {
                println("collect $value")
                delay(300)
                println("Done $value")
            } catch (ce: CancellationException) {
                println("Cancelled $value")
            }
        }
    }
    println("Collected in $time ms")
    println("main end!")
}

fun foo() = flow {
    for (i in 1..3) {
        delay(100)
        emit(i)
    }
}
```

> result

```kotlin
main start!
collect 1
Cancelled 1
collect 2
Cancelled 2
collect 3
Done 3
Collected in 654 ms
main end!
```

collect 동작중에 새로운 작업이 들어오면 기존 collect를 **취소->재시작하므로** 내부적으로는 **Cancellation Exception**이 발생합니다.

0.1초 뒤에 1이 찍히면서 0.1초 뒤에 2가 들어옴으로 1이 취소됩니다.

3이 들어옴으로써 2가 취소되고 3 이후에 값은 없기 때문에 3만 처리됩니다.   
  

**confaltion**보다 적은 속도가 걸렸습니다.

---

#### **Composing multiple flows**

**다중 flow**를 병합하는 다양한 방법들

#### Zip

**zip** operator는 두 개의 flow를 병합하는 작업을 제공합니다.

> code

```kotlin
fun main() = runBlocking {
    val numbers = (1..3).asFlow()
    val strs = flowOf("one", "two", "three")
    numbers.zip(strs) { a, b -> "$a ->$b" }
            .collect { println(it) }
}
```

> result

```kotlin
1 ->one
2 ->two
3 ->three

```

만약 두 개의 flow가 개수가 **다르다면** 적은 개수에 맞춰서 출력됩니다.

#### **Combine**

flow가 **conflation** 처럼 최신 값을 사용하는 형태라면, 현재 flow에서 최신 값만을 기준으로 연산하는 작업을 수행하도록 할 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    println("main start!")
    val numbers = (1..3).asFlow().onEach { delay(300) }
    val strs = flowOf("one", "two", "three").onEach { delay(400) }
    val startTime = System.currentTimeMillis()
    numbers.zip(strs) { a, b -> "$a ->$b" }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
    println("main end!")
}
```

> result

```kotlin
main start!
1 ->one at 424 ms from start
2 ->two at 824 ms from start
3 ->three at 1227 ms from start
main end!
```

먼저 **zip** operator를 사용하면 두 개의 flow 중 시간이 더 오래 걸리는, **즉 느린 flow에 맞춥니다.**

그래서 0.4초 간격으로 병합되어 출력되었습니다.

**zip** 대신 **combine**을 사용한다면 다음과 같습니다.

> code

```kotlin
fun main() = runBlocking {
    println("main start!")
    val numbers = (1..3).asFlow().onEach { delay(300) }
    val strs = flowOf("one", "two", "three").onEach { delay(400) }
    val startTime = System.currentTimeMillis()
    numbers.combine(strs) { a, b -> "$a ->$b" }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
    println("main end!")
}
```

> result

```kotlin
main start!
1 ->one at 438 ms from start
2 ->one at 642 ms from start
2 ->two at 838 ms from start
3 ->two at 945 ms from start
3 ->three at 1240 ms from start
main end!
```

출력된 결과의 개수가 **zip**과 다릅니다.

각각의 flow가 본인이 방출하는 시점에 맞춰 **최신 값으로 병합**하기 때문입니다.

numbers가 0.3초 이후에 "1"을 방출했습니다. 하지만 strs에는 아직 방출된 값이 없기 때문에 combine 되지 못합니다.

그래서 0.4초 뒤에 str이 "one"을 방출하는 시점에 맞춰 "1-> one"이 combine 합니다.

그리고 다시 numbers 기준으로 0.3초 이후에 "2"를 방출하고 최신 값인 "one"과 병합하여 "2-> one"을 combine 합니다.

**combine을 정리하자면**

-   두 개의 flow를 병합
-   병합은 두 개의 flow **모두 값이 존재**해야 가능 (한 쪽이라도 값이 없는 상태에서 수행되면 병합되지 못하고 생략됩니다.)
-   두 개의 flow가 각각 emit하는 시점에 각 flow의 최신값으로 병합
-   flow가 본인이 방출하는 시점에 맞춰 최신값으로 병합하기 때문에 원소 개수와 출력 개수의 쌍이 맞지 않습니다.

이해를 돕기 위한 예제 한 가지 더 보겠습니다.

> code

```kotlin
fun main() = runBlocking {
    println("main start!")
    val numbers = (1..3).asFlow().onEach { delay(100) }
    val strs = flowOf("one", "two", "three").onEach { delay(400) }
    val startTime = System.currentTimeMillis()
    numbers.combine(strs) { a, b -> "$a ->$b" }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
    println("main end!")
}
```

> result

```kotlin
main start!
3 ->one at 440 ms from start
3 ->two at 842 ms from start
3 ->three at 1246 ms from start
main end!
```

---

#### **Flattening flows**

flow는 비동기로 수신되는 값 들의 Sequence를 나타냅니다. 그러므로 어떤 flow에서 수신되는 일련의 값 들이 **다른 값들의 Sequence**를 요청하는 flow가 되는 일이 자주 발생합니다.

기본적으로 collection이나 sequence에서 중첩된 상태를 **flat 하게** 만들기 위해 flat 함수를 제공합니다.

> code

```kotlin
fun requestFlow(i: Int) = flow {
    emit("$i: First")
    delay(500)
    emit("$i: Second")
}

(1..3).asFlow().map { requestFlow(it) } // return Flow<Flow<String>>
```

위의 예제처럼 **Flow<Flow<String>>** 형태를 반환하는 중첩된 상황을 만날 수 있습니다.

#### **flatMapConcat**

**[flatMapConcat](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-concat.html)** 또는 **[flattenConcat](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flatten-concat.html)** 은 sequnce의 특성과 가장 유사하게 flow를 연결하는 operator입니다.

이 operator는 내부 flow가 **완료**되어야만 다음 외부 collect를 수행합니다.

> code

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    (1..3).asFlow().onEach { delay(100) }
            .flatMapConcat { requestFlow(it) }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
}

fun requestFlow(i: Int) = flow {
    emit("$i: First")
    delay(500)
    emit("$i: Second")
}
```

> result

```kotlin
1: First at 122 ms from start
1: Second at 627 ms from start
2: First at 729 ms from start
2: Second at 1230 ms from start
3: First at 1331 ms from start
3: Second at 1834 ms from start
```

외부의 flow가 차례로 시작되고, 내부의 flow 역시 순서대로 시작되어 내부 flow가 완료되어야만,

다음 외부 flow의 collect가 진행되고 있습니다.

만약 **map**을 사용했다면 어떻게 될까요?

> result

```kotlin
kotlinx.coroutines.flow.SafeFlow@2471cca7 at 112 ms from start
kotlinx.coroutines.flow.SafeFlow@5fe5c6f at 214 ms from start
kotlinx.coroutines.flow.SafeFlow@6979e8cb at 316 ms from start
```

flat 하게 해주지 못하여, 외부의 flow만 실행되고 내부의 flow는 수행되지 못합니다. (hashcode가 찍힙니다.)

#### **flatMapMerge**

동시에 emit 가능한 값들을 방출시키고 들어오는 모든 값들을 하나의 flow로 병합하여 collect 할 수도 있습니다.

**[flatMapMerge](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-merge.html)** 와 **[flattenMerge](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flatten-merge.html)** operator가 역할을 수행합니다.

> code

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    (1..3).asFlow().onEach { delay(100) }
            .flatMapMerge { requestFlow(it) }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
}

fun requestFlow(i: Int) = flow {
    emit("$i: First")
    delay(500)
    emit("$i: Second")
}
```

> result

```kotlin
1: First at 147 ms from start
2: First at 245 ms from start
3: First at 346 ms from start
1: Second at 647 ms from start
2: Second at 746 ms from start
3: Second at 848 ms from start
```

외부 flow는 외부 flow 대로 수행되고, 내부 flow 역시 동시에 수행되면서 하나의 flow로 병합되어 collect 됩니다.

**flatMapConcat**과 달리 순서를 보장하지 않고 외부, 내부의 flow가 각각 수행됩니다.

#### **flatMapLatest**

**[flatMapLatest](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-latest.html)는** **collectLatest와** 유사하게 flow에서 emit 발생 시 이전에 대기 중이거나 동작중인 flow는 cancel 시킵니다.

> code

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    (1..3).asFlow().onEach { delay(100) }
            .flatMapLatest { requestFlow(it) }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
}

fun requestFlow(i: Int) = flow {
    emit("$i: First")
    delay(500)
    emit("$i: Second")
}
```

> result

```kotlin
1: First at 145 ms from start
2: First at 251 ms from start
3: First at 353 ms from start
3: Second at 853 ms from start
```

**flatMapLatest는 새 값이 방출되면 그 실행 블록 전체를 취소(requectFlow(it)) 합니다.**

requestFlow() 내부의 Second 출력문은 0.5초 대기 중에 외부 flow의 emit에 의해 취소(블록 내부를 전부 cancel)되며, 

외부 flow의 emit이 완료되고 난 뒤 마지막 Second만 출력이 됩니다.

**try catch**문으로 cancel에 대한 처리도 진행 가능합니다.

> code

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    (1..3).asFlow().onEach { delay(100) }
            .flatMapLatest { requestFlow(it) }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
}

fun requestFlow(i: Int) = flow {
    try {
        emit("$i: First")
        delay(500)
        emit("$i: Second")
    }catch (ce :CancellationException) {
        println("cancelled!")
    }
}
```

> result

```kotlin
1: First at 145 ms from start
cancelled!
2: First at 252 ms from start
cancelled!
3: First at 353 ms from start
3: Second at 853 ms from start
```

반대로 내부의 Second가 emit 된다면 외부의 flow가 취소될까요?

> code

```kotlin
fun main() = runBlocking {
    val startTime = System.currentTimeMillis()
    (1..3).asFlow().onEach { delay(100) }
            .flatMapLatest { requestFlow(it) }
            .collect { value ->
                println("$value at ${System.currentTimeMillis() - startTime} ms from start")
            }
}

fun requestFlow(i: Int) = flow {
    emit("$i: First")
    delay(50)
    emit("$i: Second")
}
```

> result

```kotlin
1: First at 146 ms from start
1: Second at 196 ms from start
2: First at 250 ms from start
2: Second at 304 ms from start
3: First at 352 ms from start
3: Second at 407 ms from start
```

외부의 flow 보다 내부 flow가 더 빠르기 때문에 순서대로 emit 되어 출력됩니다.

---

#### **Flow exceptions**

collection은 emitter나 다른 operator에서 발생하는 exception으로 완료 처리될 수 있습니다.

**try catch**문으로 예외 처리를 할 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    try {
        foo().collect { value ->
            println(value)
            check(value <= 1) { "Collected $value" }
        }
    } catch (e: Throwable) {
        println("Caught $e")
    }
}

fun foo() = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}
```

> result

```kotlin
Emitting 1
1
Emitting 2
2
Caught java.lang.IllegalStateException: Collected 2
```

---

#### **everything is caught**

위의 예제는 try catch 문으로 collect를 감싸고 있기 때문에 emitter에서 발생한 예외뿐만 아니라,

중간 operator에서 발생한 예외, terminal operator에서 발생한 예외 모두를 처리합니다.

> code

```kotlin
fun main() = runBlocking {
    try {
        foo().collect { value -> println(value) }
    } catch (e: Throwable) {
        println("Caught $e")
    }
}

fun foo() = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}.map { value ->
    check(value <= 1) { "Crashed on $value" }
    "string $value"
}
```

> result

```kotlin
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
```

emit 된 값을 한 번 더 mapping 하여 같은 결과를 낼 수 있습니다.

---

#### **Exception transparency**

emitter의 코드가 자신에 의해서 발생한 exception의 handling을 캡슐화하려면 어떻게 해야 할까요?

**flow는 exception에 투명해야 합니다.**

try catch문 내부에서 flow {} builder가 값을 emit 하는 것은 예외 투명성에 어긋납니다.

emittor에서 error가 발생하였으나, collector를 수행하면서 collector를 통해 exception이 catch 되기 때문입니다.

emittor에서 **catch** operator를 사용하여 exception의 투명성을 보장하고 exception handling을 캡슐화할 수 있습니다.

**catch** operator의 body 내부에서 예외를 분석하고 이에 따라 아래와 같이 다른 처리를 할 수 있습니다.

-   throw를 이용하여 reThrown
-   catch의 body 내부에 emit 함수를 이용하여 값을 emission 
-   무시하거나, 로그에 남기거나 다른 처리를 하는 등의 코드

> code

```kotlin
fun main() = runBlocking {
    foo()
            .catch { e -> emit("Caught $e") }
            .collect { value -> println(value) }
}
```

> result

```kotlin
Emitting 1
string 1
Emitting 2
Caught java.lang.IllegalStateException: Crashed on 2
```

#### **Transparent catch**

catch 연산자는 오직 **upstream**에서 발생한 에러만 처리 가능합니다.

> code

```kotlin
fun main() = runBlocking {
    foo()
            .catch { e -> println("Caught $e") } // does not catch downstream exceptions
            .collect { value ->
                check(value <= 1) { "Collected $value" }
                println(value)
            }
}

fun foo() = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}
```

위의 예제는 collect에 check 문이 있으니, 2를 collect 할 때 예외가 발생하면서 중단됩니다.

upstream에서 발생한 예외만 처리 가능하기 때문에 catch의 출력문이 수행되지 않습니다.

#### **Catching declaratively**

collect 내부의 코드는 catch로 exception을 처리할 수 없습니다.

> code

```kotlin
fun main() = runBlocking {
    foo()
            .onEach { value ->
                check(value <= 1) { "Collected $value" }
                println(value)
            }
            .catch { e -> println("Caught $e") } // does not catch downstream exceptions
            .collect()
}

fun foo() = flow {
    for (i in 1..3) {
        println("Emitting $i")
        emit(i)
    }
}
```

> result

```kotlin
Emitting 1
1
Emitting 2
Caught java.lang.IllegalStateException: Collected 2
```

catch로 에러를 handling 하기 위해서는 collect의 body를 onEach 블록 안으로 옮기고,

그 이후에 catch를 연결하여 **collect()**를 수행하면 에러를 처리할 수 있습니다.

---

#### **Flow completion**

flow는 정상적으로 emit 한 값을 전부 collect 하거나, 중간에 예외가 발생한 경우나 **모두 완료**로 처리합니다.

collection이 완료되면 특정한 작업을 진행할 수 있도록 **명시적/암시적**으로 지정해 줄 수 있습니다.

#### **Impreative finally block**

> code

```kotlin
fun main() = runBlocking {
    try {
        foo().collect { value-> println(value) }
    }finally {
        println("Done")
    }
}

fun foo() : Flow<Int> = (1..3).asFlow()
```

> result

```kotlin
1
2
3
Done
```

try catch문 없이도 같은 결과가 출력됩니다.

flow가 complete 할 때까지는 collect라인을 넘어가지 못하기 때문에 flow의 처리가 완료되어야 다음 라인을 실행합니다.

#### **Declarative handling**

명시적으로 flow 종류 후 작업을 선언하려면 중간 연산자인 **[onCompletion](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/on-completion.html)** 을 추가합니다.

> code

```kotlin
fun main() = runBlocking {
    foo()
            .onCompletion { println("Done") }
            .collect { value -> println(value) }
}

fun foo(): Flow<Int> = (1..3).asFlow()
```

> result

```kotlin
1
2
3
Done
```

**onCompletion의** 가장 큰 장점은 람다식에서 nullable 한 Throwable을 param으로 넘겨주기 때문에,

collect의 완료가 정상적으로 되었는지, 예외 때문이었는지를 판단할 수 있게 해 줍니다.

> code

```kotlin
fun main() = runBlocking {
    foo()
            .onCompletion { cause -> if (cause != null) println("Flow completed exceptionally : $cause") }
            .catch { cause -> println("Caught exception") }
            .collect { value -> println(value) }
    println("done")
}

fun foo() = flow {
    for (i in 1..3) {
        emit(1)
        throw  RuntimeException()
    }
}
```

> result

```kotlin
1
Flow completed exceptionally : java.lang.RuntimeException
Caught exception
done
```

onCompletion은 예외를 handling 하지 않고 아래 방향으로 전달합니다.

catch에서 exception을 처리하게 됩니다.

#### **Upstream exceptions only**

catch와 동일하게 **onCompletion** 역시 **upstream** 예외만 확인 가능합니다.

> code

```kotlin
fun main() = runBlocking {
    foo()
            .onCompletion { cause -> println("Flow completed with : $cause") }
            .collect { value ->
                check(value <= 1) { "Collected $value" }
                println(value)
            }
}

fun foo() = (1..3).asFlow()
```

이를 방지하려면 **onEach**를 이용해서 collect문을 emitter에 포함시키면 됩니다.

> code

```kotlin
fun main() = runBlocking {
    foo()
            .onEach {
                value ->
                check(value <= 1) { "Collected $value" }
                println(value)
            }
            .onCompletion { cause -> println("Flow completed:$cause") }
            .catch { cause -> println("Caught exception $cause") }
            .collect()
}

fun foo() = (1..3).asFlow()
```

> result

```kotlin
1
Flow completed:java.lang.IllegalStateException: Collected 2
Caught exception java.lang.IllegalStateException: Collected 2
```

#### **Impreative vs Declartive**

**명령적** 혹은 **선언적** 방식 중에 어떤 방법이 더 좋다고 말할 수는 없습니다.

두 가지 방식 모두 유효하기 때문에 개발자의 기호나, 코딩 스타일에 따라 효율적으로 사용하면 됩니다.

---

#### **Launching flow**

비동기적인 **event**를 flow를 이용하여 쉽게 표현 가능합니다.

수신 쪽에서 event가 발생할 때마다 특정 동작을 처리하도록 하고,

그 이후의 코드는 계속 진행하기 위해서 EventListener 같은 기능이 필요할 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    events()
            .onEach { event -> println("Event: $event") }
            .collect()
    println("Done")
}

fun events() = (1..3).asFlow().onEach { delay(100) }
```

> result

```
Event: 1
Event: 2
Event: 3
Done
```

**onEach** operator는 **중간 연산자**이므로 자체적으로 collect를 수행하지 못합니다.

따라서 onEach로 event 발생 시 동작을 정의하고, 그 다음 **collect()** 같은 **terminal operator**를 이용하여

flow를 작동시켜 EventListenr와 같은 구현을 할 수 있습니다.

하지만 EventListener를 등록하는 이유는 코드는 계속 진행하되, 특정 이벤트가 발생 시에만 코드를 작동시키기 위함입니다.

이때 collect 대신 **launchIn**을 사용하여 분리된 코루틴으로 시작하고 이후 코드는 바로 실행되도록 만들 수 있습니다.

> code

```kotlin
fun main() = runBlocking {
    events()
            .onEach { event -> println("Event: $event") }
            .launchIn(this) // Launching the flow in a separate coroutine
    println("Done")
}

fun events() = (1..3).asFlow().onEach { delay(100) }
```

> result

```kotlin
Done
Event: 1
Event: 2
Event: 3
```

"Done"이 바로 출력되고, flow는 새로운 launch에서 수행됩니다.

**launchIn의 parameter로 코루틴 스코프를 명시적으로 넣어줘야 합니다.**

위의 예제는 EventListener처럼 동작하지만 코루틴의 [**structured concurrency**](https://www.slipp.net/wiki/pages/viewpage.action?pageId=49709303)에 의해서 따로 remove EventListener를 불러줄 필요가 없다는 장점이 있습니다.

**lanchIn은job을 반환합니다.** 반환되는 job을 통해서 해당 scope 전체를 취소하지 않고도 flow만 cancel 시킬 수 있고,join함수를 사용하여 원하는 시점에 대기할 수 도 있습니다.

---

#### **Flow and Reactive streams**

flow에서 사용되는 많은 함수들은 Rx Java와 매우 비슷하게 보입니다.

flow는 Reative streams의 다양한 구현에서 영감을 받았기 때문입니다.

하지만 flow는 코틀린스럽고, structured concurrecny를 유지하도록 설계되었습니다.

---
### **Preference**
​
[Kotlin) Coroutine 공식 가이드 번역 05 - Asynchronous Flow(1/2)](https://yoon-dailylife.tistory.com/66)
<br>
[Kotlin) Coroutine 공식 가이드 번역 05 - Asynchronous Flow(2/2)](https://yoon-dailylife.tistory.com/67)