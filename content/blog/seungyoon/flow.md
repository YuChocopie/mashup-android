---
title: "Coroutine Flow"
date: "2021-01-26"
tags:
  ["mash-up", "seungyoon", "coroutine", "flow"]
description: "코루틴 flow에 대해 알아보자.(1/2)"
cover: "./flow/Group3.jpg"
---

<br>
<img src="./flow/flow.png" width="500">
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

### **Preference**
​
[Kotlin) Coroutine 공식 가이드 번역 05 - Asynchronous Flow(1/2)](https://yoon-dailylife.tistory.com/66)
