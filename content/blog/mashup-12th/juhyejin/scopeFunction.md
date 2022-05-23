---
title: "Scope Function Basic"
date: "2022-05-23"
tags: ["scopeFunction", "mash-up"] 
description: "scopeFunction 추천 사용 팁"
cover: "./scope_function.png"
---

안녕하세요 안드로이드 12기 주혜진입니다~
회사에서 리뷰 받을 때 주로 제가 스코프 함수를 잘못? 사용해서 권장되는 사용법을 알려주시는 코멘트를 많이 받았었는데요~ 그래서 요번 블로그 주제로 스코프 함수로 정해봤습니다! 이전에 스코프 함수 글이 있긴 하지만! 저는 공식문서를 번역하면서 공부한 글이라 쉽게 쓱 읽기 좋을 것 같아요! 그럼 본론으로 고고!

![표](https://velog.velcdn.com/images/lily_1115/post/ee82010e-ff15-4680-88f6-a72d646c5e1e/image.png)

## 목적 
- Executing a lambda on non-null objects: let

- Introducing an expression as a variable in local scope: let

- Object configuration: apply

- Object configuration and computing the result: run

- Running statements where an expression is required: non-extension run

- Additional effects: also

- Grouping function calls on an object: with

코틀린 스코프 함수는 객체의 context 내에서 코드를 실행하는 유일한 목적이 있습니다.
람다식을 갖는 객체에 대해 이러한 함수를 call 할 때, 임시적인 스코프로 형성합니다. 스코프 안에서 객체를 표현하는 이름 없이 접근할 수 있습니다. 이런 함수를 스코프 함수라 부르고 종류는 5개입니다.

let, run, with, apply, also

기본적으로 함수는 같은 역할을 수행합니다.
: 객체위에 코드 블락을 실행함

다른 점은 이 객체가 블록 내부에서 어떻게 사용 가능하게 되는지와 전체 표현식의 결과가 무엇인지입니다.


```kotlin

Person("Alice", 20, "Amsterdam").let {
    println(it)
    it.moveTo("London")
    it.incrementAge()
    println(it)
}
```

>Person(name=Alice, age=20, city=Amsterdam)
Person(name=Alice, age=21, city=London)


만약 같은 기능을 let 없이 사용한다면 새로운 변수를 만들고 사용할 때 마다 그 이름을 반복해야 합니다.

```kotlin
val alice = Person("Alice", 20, "Amsterdam")
println(alice)
alice.moveTo("London")
alice.incrementAge()
println(alice)
```

>Person(name=Alice, age=20, city=Amsterdam)
Person(name=Alice, age=21, city=London)

스코프 함수의 유사한 특성 때문에 이들 사이의 주요 차이점을 아는 것이 중요합니다
주요 차이점은 두 가지가 있습니다.

1. context 객체를 참조하는 방법
2. 리턴 값

## Context Object: this or it

람다 스코프 함수 안에 context 객체는 그것의 실제 이름을 사용하는 대신에 짧은 참조를 이용될 수 있습니다. 각 스코프 함수는 context object에 접근하는 방법인 두 개 중 하나를 사용합니다.
this: 람다 수신자
it : 람다 변수

각각 같은 기능을 제공합니다. 이제 각각 상황에 대한 장단점을 설명하고, 추천사용법을 알려드리겠습니다.

```kotlin
fun main() {
    val str = "Hello"
    // this
    str.run {
        println("The string's length: $length")
        //println("The string's length: ${this.length}") // does the same
    }

    // it
    str.let {
        println("The string's length is ${it.length}")
    }
}
```

>The string's length: 5
The string's length is 5

### this
run, with 그리고 apply는 context this 키워드로부터 객체를 람다 수신자로 참조합니다.
그러므로 람다 안에서 객체는 일반 클래스 함수 안에서 사용할 수 있습니다.
대부분의 경우 수신 객체의 멤버에 접근할 때 this를 제거할 수 있습니다. 그러나 this는 수신 객체와 외부 객체 또는 함수를 구별하기 어렵습니다. 그래서 context object를 수신 객체인 this로 갖는 것은 주로 객체의 멤버를 계산하는 람다씩(객체 함수의 호출, 또는 프로퍼티에 값 할당)에 추천합니다.

```kotlin
val adam = Person("Adam").apply { 
    age = 20                       // same as this.age = 20 or adam.age = 20
    city = "London"
}
println(adam)
```

> Person(name=Adam, age=20, city=London)



### it

결국 let, also는 context 객체를 람다 변수로 갖습니다. 만약 변수 이름이 명시되지 않았다면, 객체는 암시적 기본 이름인 it으로 접근할 수 있습니다.
it은 this보다 더 짧고 it을 갖은 표현은 읽기 편합니다. 하지만 객체의 함수나 프로퍼티들을 호출할 때 this처럼 암시적으로 이용할 수 있는 객체가 없습니다. 그러나 context 객체를 it으로 갖는 것은 객체가 함수 호출 안에서 변수로 사용될 때 더 좋습니다. it은 또한 코드 블록의 다양한 변수를 사용할 때 더 좋습니다.

```kotlin
fun getRandomInt(): Int {
    return Random.nextInt(100).also {
        writeToLog("getRandomInt() generated value $it")
    }
}

val i = getRandomInt()
println(i)
```
>INFO: getRandomInt() generated value 99
99

아래 예제는 it을 사용하여 코드 블록의 다양한 변수를 사용한 경우 입니다.

```kotlin
    data class Apple(var weight: Int)
        class AppleTree(val appleTree: List<Apple>) {
            fun pick(): Apple {
                return appleTree[0]
            }
        }
//여기서 apply를 사용하는 경우 this는 가려지게 되고 this.weight은 fruteBasket이 아닌 apple을 참조한다.
        class FruitBasket {
            private var weight = 0

            fun addFrom(appleTree: AppleTree) {
                val apple = appleTree.pick().let { it ->
                    this.weight += it.weight
                    add(it)
                }

            }

            fun add(apple: Apple) {

            }
        }
```

추가로 context object를 변수로 전달할 때 스코프 안에서 context object의 custom name을 전달할 수 있습니다.

```kotlin
fun getRandomInt(): Int {
    return Random.nextInt(100).also { value ->
        writeToLog("getRandomInt() generated value $value")
    }
}

val i = getRandomInt()
println(i)
```
## return value
스코프 함수는 리턴되는 값에 따라 다릅니다

1. apply, also는 context 객체를 리턴
2. let, run, 그리고 with은 lamda의 결과를 리턴

### Context Obejct
apply와 also는 자기자신의 context 객체를 리턴합니다. 그러므로 그것은 call chain에 사이드 스텝으로써 포함될 수 있습니다: 함수 호출 후 동일한 개체에 대한 함수 호출을 계속할 수 있습니다.


```kotlin
val numberList = mutableListOf<Double>()
numberList.also { println("Populating the list") }
    .apply {
        add(2.71)
        add(3.14)
        add(1.0)
    }
    .also { println("Sorting the list") }
    .sort()
```

또한 context 객체를 리턴하는 함수의 문으로 사용될 수 있습니다.

```kotlin
fun getRandomInt(): Int {
    return Random.nextInt(100).also {
        writeToLog("getRandomInt() generated value $it")
    }
}

val i = getRandomInt()
```

>INFO: getRandomInt() generated value 55

### Lambda result

let, run, and with은 람다 결과를 반환합니다. 따라서 변수에 결과를 할당하거나 결과에 대한 연산을 연결하는 등의 작업을 수행할 때 사용할 수 있습니다.

```kotlin
val numbers = mutableListOf("one", "two", "three")
val countEndsWithE = numbers.run { 
    add("four")
    add("five")
    count { it.endsWith("e") }
}
println("There are $countEndsWithE elements that end with e.")
```
> There are 3 elements that end with e.

추가로 리턴 값을 무시하거나 변수에 대한 임시적인 스코프를 갖는 스코프 함수를 사용할 때 사용합니다.

```kotlin
val numbers = mutableListOf("one", "two", "three")
with(numbers) {
    val firstItem = first()
    val lastItem = last()        
    println("First item: $firstItem, last item: $lastItem")
}
```

>First item: one, last item: three

## Funtion
일반적이 사용 스타일을 정의하는 규칙을 아래 예제에서 확인 가능 합니다.

### let
호출 체인의 결과에 대해 하나 이상의 함수를 호출할 수 있습니다. 예를 들어, 다음 코드는 컬렉션에 대한 두 가지 작업의 결과를 출력합니다.

```kotlin
val numbers = mutableListOf("one", "two", "three", "four", "five")
val resultList = numbers.map { it.length }.filter { it > 3 }
println(resultList)
```
>[5, 4, 4]

let 사용 시 

```kotlin
val numbers = mutableListOf("one", "two", "three", "four", "five")
numbers.map { it.length }.filter { it > 3 }.let { 
    println(it)
    // and more function calls if needed
} 
```
>[5, 4, 4]

null 검사에도 사용합니다.
null이 될 수 없는 타입을 파라미터로 받는 함수에 널이 될 수 있는 타입의 값을 넘길 수는 없습니다. 따라서 let함수를 통해 널이 될 수 있는 타입의 값을 널이 될 수 없는 타입의 값으로 바꿔서 전달하기 위해 사용합니다.

```kotlin
val str: String? = "Hello"   
//processNonNullString(str)       // compilation error: str can be null
val length = str?.let { 
    println("let() called on $it")        
    processNonNullString(it)      // OK: 'it' is not null inside '?.let { }'
    it.length
}
```

>let() called on Hello

또한 코드 가독성을 높이기 위해서 제한된 범위의 로컬변수로도 사용합니다. 이를 위해서는 it대신 lambda 변수 이름으로 제공해야 합니다.

```kotlin
val numbers = listOf("one", "two", "three", "four")
val modifiedFirstItem = numbers.first().let { firstItem ->
    println("The first item of the list is '$firstItem'")
    if (firstItem.length >= 5) firstItem else "!" + firstItem + "!"
}.uppercase()
println("First item after modifications: '$modifiedFirstItem'")
```

>The first item of the list is 'one'
First item after modifications: '!ONE!'


### with
비 확장 함수 : context 객체는 인수로 전달되지만, lambda 내부에 수신기로 사용할 수 있습니다. 반환 값은 lambda 결과입니다. 람다 결과를 제공하지 않고 context 객체의 함수, 프로퍼티를 호출하려면 사용하는 것이 좋습니다. 코드에서는 "이 객체를 사용하여 다음을 수행합니다"로 읽습니다.

```kotlin
val numbers = mutableListOf("one", "two", "three")
with(numbers) {
    println("'with' is called with argument $this")
    println("It contains $size elements")
}
```

>'with' is called with argument [one, two, three]
It contains 3 elements

또 다른 사용 사례는 값을 계산하는 데 사용할 프로퍼티 또는 함수를 사용하는 도우미 객체를 도입하는 것입니다.

```kotlin
val numbers = mutableListOf("one", "two", "three")
val firstAndLast = with(numbers) {
    "The first element is ${first()}," +
    " the last element is ${last()}"
}
println(firstAndLast)
```

>The first element is one, the last element is three

### run 
context 객체를 lambda 수신기로 사용할 수 있습니다. 반환 값은 람다 결과입니다. 실행은 let과 동일한 기능을 수행하지만, 문맥 개체의 확장 함수로 let을 호출합니다. (추가적인 연산을 진행하고 그값을 반환하는...) run은 람다에 객체 초기화 및 반환 값 계산이 모두 포함된 경우에 유용합니다.

```kotlin
val service = MultiportService("https://example.kotlinlang.org", 80)

val result = service.run {
    port = 8080
    query(prepareRequest() + " to port $port")
}

// the same code written with let() function:
val letResult = service.let {
    it.port = 8080
    it.query(it.prepareRequest() + " to port ${it.port}")
}
```

 >Result for query 'Default request to port 8080'
Result for query 'Default request to port 8080'

확장자가 아닌 함수로 사용할 수 있습니다. 비 확장 실행을 사용하면 식이 필요한 경우 여러 문의 블록을 실행할 수 있습니다.

```kotlin
val hexNumberRegex = run {
    val digits = "0-9"
    val hexDigits = "A-Fa-f"
    val sign = "+-"

    Regex("[$sign]?[$digits$hexDigits]+")
}

for (match in hexNumberRegex.findAll("+123 -FFFF !%*& 88 XYZ")) {
    println(match.value)
}
```
>+123
-FFFF
88

### apply
값을 반환하지 않고 주로 수신기 객체의 멤버에서 작동하는 코드 블록에 대해 apply를 사용합니다. 일반적인 경우는 객체 구성입니다. 이러한 호출은 "객체에 다음 할당을 적용"으로 읽을 수 있습니다. 또한 chain도 적용할 수 있습니다.

```kotlin
val adam = Person("Adam").apply {
    age = 32
    city = "London"        
}
println(adam)
```
>Person(name=Adam, age=32, city=London)

### also
객체를 인수로 사용하고 객체를 반환합니다. 객체의 속성 및 기능 대신 참조 객체의 참조가 필요한 작업이나 외부 범위에서 this에 의해 가려지지 않으려면 사용합니다. 코드에서도 "객체에 대해 다음 작업을 수행할 수도 있습니다."라고 읽을 수 있습니다.

```kotlin
l numbers = mutableListOf("one", "two", "three")
numbers
    .also { println("The list elements before adding new one: $it") }
    .add("four")
```
>The list elements before adding new one: [one, two, three]

## 참고 
https://kotlinlang.org/docs/scope-functions.html#function-selection