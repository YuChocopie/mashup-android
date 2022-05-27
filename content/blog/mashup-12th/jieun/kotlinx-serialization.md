---
title: "Kotlinx-Serialization"
date: "2022-05-28"
tags: ["mash-up", "jieun", "serialization"] 
description: "Kotlinx-Serialization 라이브러리가 무엇인지, 특징, 사용법에 대해서 알아보자~"
cover: "./images/jieun_cover.png"
---

안녕하세요 안드로이드 12기 이지은입니다.

입사한지 얼마 안되었을때, 팀장님께서 붙여놓은 @Serializable 어노테이션을 보고 parcelable과 맨날 비교하는 그 serializable(Java 인터페이스)인줄 알고 질문을 했던적이 있었습니다.ㅎㅎ 그때 처음으로 kotlinx Serialization라이브러리 라는것을 알게 되었고, 어떻게 사용하는지 왜 쓰는지 등이 궁금해서 이번 기회에! 정리해보려고 가져와봤습니다.😊

### Serialization

Android에서 서버통신을 할때 서버 데이터인 JSON 형식을 직렬화 및 역직렬화를 하면서 Gson, Moshi 등의 라이브러리를 많이들 사용하시죠!   

<img src="https://user-images.githubusercontent.com/53978090/170328015-b3b18548-d640-4721-afe7-2d79e0e654a5.png" width="500" height ="250">

저도 원래는 제일 익숙한 Gson만 사용하다가, 구글 코드랩에서 Moshi를 사용하는걸 보고 Moshi도 살짝 맛을 봤었습니다! 

- Gson vs Moshi 는 요기!    
 
    https://proandroiddev.com/goodbye-gson-hello-moshi-4e591116231e


이렇게 Gson과 Moshi만으로도 데이터 직렬화(역직렬화)를 할 수 있지만, "data class의 default value를 무시하고 0 또는 null로 직렬화(역직렬화) 한다" 라는 문제점이 있습니다.


> Gson을 사용하여 직렬화 했을때
```kotlin
fun main() {
    val data = """
        {
            "name" : "jieun"
        }
    """

    val result = Gson().fromJson(data,Person::class.java)
    println(result)
}

data class Person(
    val name: String,
    val age: Int = 20,
    val hobby: String="lol",
)
```
예를들어서 다음과 같은 데이터 클래스를 직렬화 했을때, 결과가 어떻게 나올까요?


```kotlin

Person(name=jieun, age=0, hobby=null)
```

위의 예제에서는 age에 설정한 default value를 무시하고 0이되며, hobby는 Not-Nullable 타입인데도 null이 들어가 예상과 다른 결과가 나옵니다.(앱이 터져버릴수도 있겠죠..?😢) 

이러한 문제점은 kotlinx Serialization을 사용하여 해결할 수 있습니다!

### Kotlinx Serialization이란? 

[kotlinx Serialization](https://github.com/Kotlin/kotlinx.serialization)은 JetBrains에서 만든, 말 그대로 Kotlin을 위한 JSON 라이브러리입니다! 

Kotlinx Serialization의 특징으로는 어떤게 있을까요??

> 첫번째로, **빠른 JSON 인코딩 & 디코딩을 지원합니다.** 

<img src="https://user-images.githubusercontent.com/53978090/170738840-1546cad7-5166-4080-ae25-568e5efa26b2.png" width="700" height ="350">

위의 사진은 kotlinx serialization을 사용했을때, 속도가 얼마나 향상됐는지를 나타냅니다.

최근 kotlinx.serialization 1.2버전이 출시되면서, JSON 디코더를 다시 작성하고 JSON 인코더를 크게 최적화했기 때문에 이전 버전보다 직렬화 속도가 최대 2배 빨라졌습니다. :) 

> 두번째로, **멀티플랫폼을 지원합니다.** 

자주 사용하는 Gson과 Moshi는 모두 자바 라이브러리이므로, 자바를 지원하는 플랫폼(ex 안드로이드, Spring FrameWork 등)에서만 사용할 수 있습니다. 하지만 Kotlinx Serialization 라이브러리는 자바, 자바스크립트, 네이티브 등 다양한 플랫폼을 지원하기떄문에 공용 라이브러리에 구현해서 사용할 수 있습니다.

> 세번째로, **코틀린을 지향합니다.**

위의 코드에서 Gson 라이브러리로 파싱했을때, default value는 무시하고 0이 되며, Not-Nullable 타입이 null이 되는 문제가 생겼었습니다. 하지만 Kotlinx Serialization 라이브러리를 사용하면 해당 변수에 프로퍼티를 포함하고 있지 않음을 확인해서 null 대신 기본값을 대입합니다! (이 부분은 밑의 코드에서 확인하실 수 있습니다!) 

> 네번째로, **컴파일 안전을 보장합니다.**

다른 라이브러리와는 다르게 Kotlinx Serialization 라이브러리는 @Serializable 어노테이션이 있는 클래스만 직렬화하기때문에, 직렬화를 수행할 수 없는 경우 런타임 에러 대신 컴파일 에러가 발생하므로 버그를 사전에 방지할 수 있습니다. 


### 사용하는 방법

Kotlinx Serialization 라이브러리에 대해 간단하게 알아봤는데요, 그렇다면 어떻게 사용할까요 ??

먼저, 코틀린 Serialization 라이브러리를 사용하기 위해 의존성을 추가해줍니다.


build.gradle(Project)
```kotlin
buildscript {
    ext {
        kotlin_version = '1.4.10'
    }

    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-serialization:$kotlin_version"
    }
}
```

build.gradle(Gradle)
```kotlin
plugins {
    id 'kotlinx-serialization'
}

dependencies {
    implementation "org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.2"
}
```

그 다음에 직렬화를 적용할 클래스에 @Serializable 어노테이션을 추가해줍니다.

```kotlin
@Serializable
data class Person(
    val name: String,
    val age: Int = 20,
    val hobby: String="lol",
)
```

그리고 json String을 객체로 가져와야하기 때문에 Json.decodeFromString() 함수를 사용하면 됩니다! 

```kotlin
fun main() {
    val data = """
        {
            "name" : "jieun"
        }
    """

    val result: Person = Json.decodeFromString(data)
    println(result)
}
```

실행 결과 
```kotlin
Person(name=jieun, age=20, hobby=lol)
```

JSON파일에 age, hobby필드가 없더라도 설정해둔 default value를 사용했기 때문에 원하던 결과가 나왔습니다! 아주 간단하죠 : )  


그렇다면 kotlinx Serialization에서 주로 사용하는것들은 어떤것들이 있을까요 ??

> Json.decodeFromString() 
 
json String을 객체로 변환합니다. (decoding)

> Json.encodeToString()

객체를 Json String으로 변환합니다. (encodeing)

```kotlin
private fun makePersonJson() {
    val personA = Person("jieun", 20, "overwatch")
    val personJson = Json.encodeToString(personA)
    println(personJson)
}

@Serializable
data class Person(
    val name: String,
    val age: Int,
    val hobby: String = "lol",
)
```


```kotlin
{"name":"jieun","age":20,"hobby":"overwatch"}
```

>Ignore Unknown keys 

json string에 정의되어 있으나 맵핑하려는 Model에 해당하는 칼럼이 없을 경우 발생하는 에러를 무시합니다. 

```kotlin
fun main() {
    val data = """
        {
            "name" : "jieun"
            "address" : "seoul"
        }
    """

    val result:Person = Json.decodeFromString(data)
    println(result)
}

@Serializable
data class Person(
    val name: String,
    val age: Int = 20,
    val hobby: String="overwatch",
)
```
위의 json에는 Person클래스에 없는 address라는 칼럼값이 들어가있고, decodeFromString을 통해 decoding을 하면 다음과 같은 에러를 발생시킵니다.

```kotlin
Exception in thread "main" kotlinx.serialization.json.internal.JsonDecodingException: Unexpected JSON token at offset 53: Encountered an unknown key 'address'.
Use 'ignoreUnknownKeys = true' in 'Json {}' builder to ignore unknown keys.
JSON input: 
        {
            "name" : "jieun"
            "address" : "seoul"
        }
```
address라는 알수없는 값이 있어서 decode를 할 수 없으니, ignoreUnknownKeys를 true로 해달라고 친절하게 알려주네요😢

```kotlin
fun main() {
    val json = Json { ignoreUnknownKeys = true }
    val data = """
        {
            "name" : "jieun"
            "address" : "seoul"
        }
    """

    val result:Person = json.decodeFromString(data)
    println(result)
}

@Serializable
data class Person(
    val name: String,
    val age: Int = 20,
    val hobby: String="overwatch",
)
```

```
Person(name=jieun, age=20, hobby=overwatch)
```

이렇게 ignoreUnknownKeys = true 를 써주면 맵핑하려는 클래스에 해당 값이 없어도 무시하고 잘 파싱됩니다. 

이외의 사용법은 [kotlinx Serialization 가이드](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/serialization-guide.md)에 자세하게 나와있으니 참고하면 좋을거 같습니다~ 


### 마무리~
위의 Kotlin Serialization 가이드에 가보면 알 수 있듯이 많은 기능들이 있지만, 자주 사용하는 것들은 평소에 사용하는 Gson과 크게 사용법이 다른거 같진 않더라구요! 그리고 아까 얘기했던 null문제, default value 등을 
해결할 수 있는 점이나 체감상은 잘 모르겠지만 속도도 빠르다 하니, 주로 Kotlin으로 개발하는 요즘! Kotlinx Serialization 라이브러리 사용해보시는거 추천합니다.🤗🤗

---
### 출처

https://blog.jetbrains.com/ko/kotlin/2021/05/kotlinx-serialization-1-2-released/

https://blogharu.github.io/cs/general/01.data_serialization.html

https://velog.io/@cmplxn/Kotlinx-Serialization

https://www.androidhuman.com/2020-11-08-kotlin_1_4_serialization

https://medium.com/swlh/kotlinx-serialization-part1-4407893132c2

https://tourspace.tistory.com/357

https://blog.mathpresso.com/%EC%8B%A0%EC%9E%85-%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-kotlinx-serialization-%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81-%EC%84%9C%EC%82%AC%EC%8B%9C-740597911e2e