---
title: "Kotlin Scope Function"

date: "2020-12-27"

tags: ["huijiny", "mash-up", "kotlin", "scope-function"]

description: "코틀린 범위 지정 함수에 관해서!"

cover: "./희진.png"
---안녕하세요 여러분!

<br>

mash-up 10기 신입 유희진입니다! 햐햐

저는 이번 코틀린 스터디에서 다뤄본 범위 지정 함수에 대해서 써볼까 합니다. 저는 개인적으로 코틀린을 처음 사용해본 것이 이번년도 7월이었는데, 그 때 제대로 배우질 못해서, 좀 코틀린을 자바처럼(?) 사용했던 것 같아요. 그러다 범위 지정함수라는 `let, also, run, with, apply`이 다섯 종류의 함수들을 알게되었는데, 제일 자바와는 다르게 느껴졌던 기능이었고, 계속 헷갈리는 기능들인 것 같아요. 저는 사실 이름에서 기능을 유추하기도 힘들다고 생각해요,,(ㅎ)

아무튼간, 이번 코틀린 스터디에서 다시 한 번 다루게 되면서 이젠 제대로 좀 알아보자싶어 블로그에 정리하면서 복습해보려고 합니다.

# Scope Function

범위 지정 함수는 고차함수로 정의됩니다. 즉, 다른 함수를 인수로 사용합니다. 이런 인수는 특정 경우에 수신자와 함께 함수 리터럴로 나타날 수도 있습니다.

범위 지정 함수는 임의의 **context**를 가져와 다른 scope로 넘기는데요, 그 scope안에서는 함수에 따라서 it이나 this로서 표현됩니다.

## let

Documentation: [https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/let.html)

```kotlin
inline fun <T, R> T.let(**block**: (T) -> R): R
```

저도 let 함수때문에 범위 지정함수를 알게되었는데, 아마 여러분도 처음에 가장 많이 보지 않으셨나요? scope function에서 가장 유명한 함수인 let입니다.

### 특징

- receiver이고 context 객체인 `T`의 extension으로서 정의됌.
- Generic type인 `R`이 리턴 값임.
- `block`의 결과 `R`은 `let` 자신임.
- 타입이 `(T) -> R` 인 일반 함수의 `block` 인자
- receiver `T` 는 `block` 에게 인자로서 넘어감

### Use Cases

#### A. **`if (object != null)` 의 대체**

[Kotlin Idioms](https://kotlinlang.org/docs/reference/idioms.html#execute-if-not-null) 섹션에 보면 let은 특정 객체가 null이 아닐 경우에 대한 블록으로 사용됩니다.

```kotlin
val len = text?.let {
    println("get length of $it")
    it.length
} ?: 0
```

nullable 인 text 변수는 let에 의해 새로운 scope를 생성하고, 그 안에서 text는 it으로서 작용해요.

#### B.**null이 아닌경우 nullable 값의 mapping**

`let` 함수는 또한 변형을 위해서 사용되기도 하는데요, 특히 nullable 타입의 변형에서 사용돼요. 이 또한 idioms에 정의되어 있습니다.

```kotlin
 val mapped = value?.let { transform(it) } ?: defaultValue
```

#### C. **Confine scope of variable/computation**

만약 특정 변수나 계산등이 꼭 확인되고 지정된 범위 안에서만 사용가능하고 바깥의 범위에서는 사용되지 않아야한다면 let을 쓰는게 좋습니다.

```kotlin
val transform = "stringConfinedToLetScope".let {
    println("variable can be accessed in let: $it")
    "${it.length}$it"
}
//cannot access original string from here
}
```

## run

Documentation: [https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/run.html)

```kotlin
inline fun <T, R> T.run(block: T.() -> R): R
```

### 특징

- receiver이고 context 객체인 `T`의 extension으로서 정의됌.
- Generic type인 `R`이 리턴 값임.
- `block`의 결과 `R`은 `run` 자신임.
- 타입이 `T.() -> R` 인 일반 함수의 `block` 인자

`run` 함수는 `block` 이 정의되는 방법 빼고(4번) 모두 `let` 과 같습니다.

### Use Cases

`run` 은 기본적으로 `let` 과 많이 비슷한데, 대신 receiver T가 람다 인자 안에서 this로서 보여집니다.

#### A. **`if (object != null)` 의 대체 **

```kotlin
val len = text?.run {
    println("get length of $this")
    length //this can be omitted
} ?: 0
```

예시에서 보면 this.length라고 쓰지 않고, 그냥 length라고 쓰였는데, this는 scope안에서 생략이 가능합니다.

#### B. **Transformation**

run은 변형할 때 또한 사용하기 좋은데요, 아래 있는 예시를 보면 let을 사용했을 때 보다 this를 아래서 반복할 필요가 없어 더욱 읽기가 쉽습니다.

```kotlin
import java.util.Calendar

val date: Int = Calendar.getInstance().run {
    set(Calendar.YEAR, 2030)
    get(Calendar.DAY_OF_YEAR) //return value of run
}
```

## also

Documentation: [https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/also.html)

```kotlin
inline fun <T> T.also(block: (T) -> Unit): T
```

`also` 함수는 코틀린 언어에 가장 최근에 추가된 범위지정함수인데요, [version 1.1](https://youtrack.jetbrains.com/issue/KT-6903)에서 추가되었다고 합니다.

### 특징

- receiver이고 context 객체인 `T`의 extension으로서 정의됌.
- receiver 객체인 `T`가 리턴 값임.
- 타입이 `(T) -> Unit` 인 일반 함수의 `block` 인자
- receiver `T` 는 `block` 에게 인자로서 넘어감

`also` 는 결과로 `T`를 반환한다는 것 빼고 `let` 와 같답니다 !

### Use Cases

#### A. **Receiver가 블록 안에서 사용되지 않을 때**

이게 무슨말일까요! context 객체와 관련된 어떤 task를 하고 싶지만, 그 객체 자체는 람다 안에서 사용되지 않을 때 사용됩니다. 예를들어 로그를 찍는 일이 있습니다. Kotlin [coding conventions](https://kotlinlang.org/docs/reference/coding-conventions.html#using-scope-functions-applywithrunalsolet) 에 설명 되어 있듯이, `also` 는 아래의 예시처럼 사용되기를 추천하고 있습니다.

```kotlin
val num = 1234.also {
    log.debug("the function did its job!")
}
```

이 경우, 거의 한 문장처럼 읽힌다고 하는데요(흠) `변수에 어떤걸 할당하고 "또한(also)" 콘솔에 로그를 찍어라!` 이런 식으로. 아무튼, 그래서 코틀린 코딩 컨벤션에서 로그를 찍으려고할 때 사용되기를 권장하고 있는 것 같습니다.

#### B. **object를 초기화 할 때**

also가 사용되는 흔한 시나리오 중 또 하나는 객체를 초기화할 때 라고 합니다. 앞서 소개시켜드린 `run` 과`let` 과는 반대로 `also` 는 블록을 실행한 뒤 수신자 객체를 반환해요.

```kotlin
val bar: Bar = Bar().also {
    it.foo = "another value"
}
```

보이시는 것 처럼, bar가 생성이 된 직후 also를 통해 바로 property를 초기화 하고 있어요. also는 수신자 자기 자신을 반환하기 때문에 가능한 일인거죠!

#### C. **계산된 값을 할당할 때**

`also`가 수신자 객체를 리턴한다는 특징이 있기 때문에, 객체에서 다른 프로포티의 값이 계산되고 이것저것 하고 난 뒤 다시 할당할 때 사용 될 수 있어요.

```kotlin
fun getThatBaz() = calculateBaz().also { baz = it }
```

값이 계산되고 난 뒤 also를 통해서 다시 할당되고 있어요.

## apply

Documentation: [https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/apply.html)

```kotlin
inline fun <T> T.apply(block: T.() -> Unit): T
```

`apply`함수는 커뮤니티에서 요구해서 추가하게 된 함수 중 하나라고 해요. 가장 많이 사용될 때는 `also`와 같이 초기화 할 때라고 합니다.

### 특징

- receiver이고 context 객체인 `T`의 extension으로서 정의됌.
- receiver 객체인 `T`가 리턴 값임. (여기서도 also와 같이 수신자 객체를 반환하죠!!?!?!?)
- 타입이 `T.() -> Unit` 인 일반 함수의 `block` 인자

### Use Cases

#### A. **객체 초기화**

궁극적인 `apply`의 목적이 `초기화`라고 해요. 커뮤니티에서 언어를 만드는 거의 마지막 단계? 쯤에서 요구했다고 하는데요 [여기](https://youtrack.jetbrains.com/issue/KT-6094)서 그 과정을 보실 수 있으세요!

```kotlin
val bar: Bar = Bar().apply {
    foo1 = Color.RED
    foo2 = "Foo"
}
```

앞에서 보여드렸듯이 `apply` 가 이 과정을 물론! 대체할 수 있지만, 큰 장점은 보시면 아실 수 있듯이 `it`을 쓸 필요가 없습니다. 여기서 Bar()은 this로 표현이 되고 있어요. 그런데 위에 `run`에서 보셨듯 this는 생략이 가능해요! [이곳](https://stackoverflow.com/questions/46131289/kotlin-what-is-the-difference-between-apply-and-also/46132223#46132223)에서 `also`와 `apply`의 차이점에 대해서 보실 수 있습니다.

#### B. **Unit을 리턴하는 Builder 스타일의 메소드의 사용**

[Kotlin Idioms](https://kotlinlang.org/docs/reference/idioms.html#builder-style-usage-of-methods-that-return-unit)에 정의되어 있듯, apply는 unit을 리턴하는 메소드를 래핑할 때 사용된다고 합니다.

```kotlin
data class FooBar(var a: Int = 0, var b: String? = null) {
    fun first(aArg: Int): FooBar = apply { a = aArg }
    fun second(bArg: String): FooBar = apply { b = bArg }
}

fun main(args: Array<String>) {
    val bar = FooBar().first(10).second("foobarValue")
    println(bar)
}
```

이 예에서 class가 Builder style API를 클라이언트에 노출하려고 하기 때문에 여기서 apply는 setter 처럼 사용되는 메소드를 정의하기에 매우 유용하다고 합니다.

## with

Documentation: [https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/with.html)

```kotlin
inline fun <T, R> with(receiver: T, block: T.() -> R): R
```

드디어 마지막 함수입니다. 이 함수는 위의 네 개의 함수와 조금 많이 다른데요, 생긴 것 부터 좀 달라요. 일단 확장 함수가 아닙니다.

### 특징

- receiver, context객체 `T`를 첫번째 인자로 받는 독립된 함수
- 블록의 결과 `R`은 `with`자신임.
- 타입이 `T.() -> R` 인 일반 함수의 `block` 인자

`with`함수는 `R`을 리턴한다는 점에서 `let`, `run`과 같지만 종종 `apply`와 비슷하다고 많이들 말한다고 해요. `apply와 with의 차이점`은 [여기](https://stackoverflow.com/questions/36625329/kotlin-apply-vs-with/48736376#48736376)서 확인하실 수 있습니다. `with`은 람다의 **마지막 줄을 리턴**하고, `apply`는 **람다 결과 객체를 반환**한다고 합니다.

### Use Cases

#### A. **확인된 scope에서 객체를 적용할 때**

[Kotlin Idion](https://kotlinlang.org/docs/reference/idioms.html#calling-multiple-methods-on-an-object-instance-with)에 정의되어 있는 것은, `with`는 객체를 확인된 범위 내에서만 사용하고 싶을 때 사용한다고 합니다.

```kotlin
val s: String = with(StringBuilder("init")) {
    append("some").append("thing")
    println("current value: $this")
    toString()
}
```

with은 인스턴스 자체를 외부 범위에 노출하지 않고 StringBuilder에 대한 호출들을 wraaping하는데 사용하고 있습니다.

#### B. **member extensions of a class**

확장함수는 보통 패키지 레벨에서 정의되어 쉽게 아무데서나 import되고 접근할 수 있습니다. 또한 class나 object레벨에서도 정의될 수 있는데 이는 "member extension function"이라고 불린다고 합니다. 이런 종류의 확장함수들은 클래스 안에서 쉽게 사용되는데 클래스 외부에서는 사용되지 않는다고 합니다. 둘러싸는 클래스 외부에서 엑세스 할 수 있도록 하려면 해당 클래스를 "scope안으로" 가져와야하는데, 이 곳에서 `with`함수가 유용하다고 합니다.

```kotlin
object Foo {
    fun ClosedRange<Int>.random() =
        Random().nextInt(endInclusive - start) + start
}

// random() can only be used in context of Foo
with(Foo) {
    val rnd = (0..10).random()
    println(rnd)
}

```

위에서 보여지는 Foo 객체는 멤버 확장 함수인 random()을 정의하고 있습니다. 그리고 이 함수는 이 객체의 범위 내에서만 쓰입니다. `with`함수를 사용하여 쉽게 해결할 수 있습니다. 이 전략은 특정한 확장 기능을 의미있게 그룹화 해야하는 경우 권장된다고 합니다.

## Comparsion

5개의 함수를 모두 알아보고, 코틀린 idioms에 있는 예시도 알아봤는데요, 함께 놓고 비교해보겠습니다.

```kotlin
//return receiver T
fun  T.also(block: (T) -> Unit): T //T exposed as it
fun  T.apply(block: T.() -> Unit): T //T exposed as this

//return arbitrary value R
fun <T, R> T.let(block: (T) -> R): R //T exposed as it
fun <T, R> T.run(block: T.() -> R): R //T exposed as this

//return arbitrary value R, not an extension function
fun <T, R> with(receiver: T, block: T.() -> R): R //T exposed as this
```

`also`와 `apply`는 둘 다 실행 뒤에 수신 객체 T를 반환합니다. `apply`에서는 블록안에서 T는 `this`로 표현되고 반면에 `also`에서 T는 `it`으로 표현됩니다.

`let`과 `run`은 둘 다 실행 뒤 임의의 결과 R을 반환합니다. 그리고`run`은 수신자가 있는 함수 리터럴로 작동하지만 `let`은 간단한 함수 타입을 사용합니다.

`with`은 다른 4가지와 가장 다른 함수였는데요, T의 확장함수로 정의되지 않습니다. 두 가지 파라메터를 갖고 그 중 첫 번째는 이 scope function의 수신자 객체를 나타냅니다.

![definition_table](/definition_table.png)

### 참고자료

https://kotlinexpertise.com/coping-with-kotlins-scope-functions/
