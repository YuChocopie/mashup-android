---
title: Dependency Injection And Service Location
date: "2021-01-26"
tags: ["mash-up","DI", "Dependency Injection", "Service Location"]
description: "Dependency Injection And Service Location 번역 및 내용 정리 글"
cover: "./thumbnail_post.png"
---

안녕하세요. 안드로이드 10기 이진성입니다.

본 포스팅은 [Dependecy Injection and Service Location](https://medium.com/modulotech/dependency-injection-and-service-locator-6144ed55a8e) 글을 번역 및 정리한 것입니다. 

## Dependecy Injection

DI는 항상 안드로이드 커뮤니티에 오르고 내린 주제였다. 개인적으로 그렇게 어려운 개념은 아니지만 안드로이드 개발자들은 여전히 클린한 방법에 대해 논쟁하고 싸우고 있습니다.

 커뮤니티에서 활발한 논쟁을 하고 있음에도 이 문제에 대해 만족스러운 대답을 도출하지 못했습니다.  이 논쟁에 대한 가장 큰 장벽은 Activity와 Fragment의 Constructor은 파라미터를 갖지 못하는 것입니다. 그리고 이러한 컴포넌트들은 생성과 파괴를 어플리케이션 라이프사이클에 맞춰 이뤄집니다. 이러한 요소들이 안드로이드에서 DI를 불가능하게 만듭니다.

몇년 전까지 우리는 **Dagger**를 제외한 DI 프레임워크를 선택할 수 없었습니다. Dagger 만이 유일한 선택지였고 공식적으로도 구글이 권했습니다.  Dagger의 사용은 우리에게 편리성을 제공했지만 몇몇 개발자들은 그러하지 못했습니다. 왜 그랬을까요?  Dagger는 어렵고 아까 말씀드렸다시피 유일한 선택지였기 때문입니다.

**Koin**과 같은 다른 프레임워크에 대한 아티클을 봤을 떄, 많은 사람들이 "유레카"를 외쳤습니다. 나는 이러한 상황을 인정하지만 왜 Koin이 Dagger에 비해 더 친화적인지 모르곘습니다. 이 둘은 결국 같은 문제를 해결하는 겁니다.

어느날 나는 우연히 Dagger와 Koin에 대한 한 아티클을 알게 되었습니다.  Service Locator 라는 새로운 개념을 접하게 된 거다! Koin은 DI로의 여정에서 나를 덜 힘들게 만든 첫번째 단계였고 Service Locator라는 개념은 내가 안드로이드에서 DI를 더 깊게 이해하는 두번째 단계였다. 이 모든 단계를 통해서 나는 안드로이드에서 이상적인 DI는 없다는걸 받아들이게 되었다. 세계 또한 이상적이지 않으니 이건 큰 문제가 되지 않는다. 우린 적응하면 된다. 🔥


## DI 패턴의 순수한 구현

블로그의 주 내용은 **Dependency Injector** 와 **Service Locator**의 차이를 설명하는 거다. 이를 위한 첫번째 단계로 간단한 DI 구현에 대해 보여줄러고 한다. DI 패턴은 3 가지 클래스 타입을 가집니다.

1. Client class (or Consumer class) :  서비스에 의존하는 클래스
2. Service class : 서비스를 제공하는 클래스
3. Injector class : 서비스에서 클라이언트로 주입시키는 책임을 가진 클래스

### 예제

message를 목적지에 전달하는 **MessageService**가 있습니다. 우리는 메시지가 어떻게 전달되는지 모르지만 처리하는 방법이 있다는 것을 압니다. 그래서 우리는 서비스를 인터페이스를 사용해 표현합니다.

``` kotlin
interface MessageService {
  
    fun sendMessage(message: String, destination : String)
  
}
```

**MessageService**를 구현한 **SMSService**

```kotlin
class SMSService : MessageService {
    override fun sendMessage(message: String, destination: String) {
        println("Sending $message to $destination using SMSService")
    }
}
```

다음으로 메시지를 전달하기 위해 **MessageService**를 사용하는 **MessageClient** 클래스가 있습니다. 의존성 역전 원칙(DIP)에 의해 모듈은 추상화에 의존해야 합니다. 

``` kotlin
class MessageClient(private val service: MessageService) {
    fun chatToFriend(message: String, destination: String) {
        service.sendMessage(message, destination)
    }
}
```

어떻게 사용되는지 확인해 볼까요.

```kotlin
class Component {
  
    val client : MessageClient = MessageClient(SMSService()) 
  
    fun main(){
         val destination = "Moon"
         client.chatToFriend("Hello, I'm from the Earth!", destination)
    }
}
```

이것이 간단한 DI 예제이다. 그럼 Dagger의 방법에 대해 살펴보자.


## 간단한 구현의 Dagger

Dagger는 DI 패턴의 구조를 따라갑니다. 그렇기에 Client (Activity, Fragment)는 여전히 Injector의 존재를 압니다. 의존성 그래프를 그리기 위해 AppComponent는 의존되는 Activity의 onCreate에서 있어야 합니다.

```kotlin
@Component(modules = [AppModule::class])
interface AppComponent {
    fun inject(mainActivity : MainActivity)
}
```

onCraete 함수

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    (applicationContext as Appplication).appComponent.inject(this)
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
}
```

이러한 이유로 Dagger는 클린한 DI는 아니지만 안드로이드라는 특별한 상황에서 충분한 기능을 제공합니다. 이제 우리는 Koin에 대해 알아보겠습니다. Koin은 왜 Dependency Injector가 아닌 Service Locator 라고 부르는 걸까요?

## Koin과 Service Locator 

위 예제와 비교해서 Koin은 injection을 Activity 또는 Fragment에 제공하지 않습니다.  

```koin
class MainActivity : AppCompatActivity() {
      private val viewModel : MainViewModel by viewModel()
}
```

**by viewmodel()** 은 객체를 Central Registry(중앙 등록자)로부터 가져오는 getter와 비슷합니다. 이것은 누구든지 필요한 경우 바로 접근이 가능합니다.  이것이 바로 Locator라고 불리는 이유입니다.

  이것이 Dependency Injection과 Service Locator가 의존성에 접근하는 문제를 푸는 방법에서 다른 이유입니다.  하나는 injects를 다른 하나는 locates를 사용합니다. 그리고 Koin은 공식적으로 DI 프레임워크라고 [소개](https://github.com/InsertKoinIO/koin)되고 있습니다.

  이것이 개발자들이 Koin을 애용하지만 DI로 생각하고 실수로 사용하는 이유입니다. 그러나 Service Locator는 종종 [anti-pattern](https://en.wikipedia.org/wiki/Service_locator_pattern#:~:text=The%20service%20locator%20pattern%20is,to%20perform%20a%20certain%20task.)으로 비판되어 집니다.

  아래 예제를 보겠습니다.

  ```kotlin
class MessageClient() {
    private val service = Locator.GetService<MessageService>()
    fun chatToFriend(message : String, destination : String) {
        service.sendMessage(message, destination)
    }
}
  ```

- 파리미터를 가진 constructor를 사용하지 않고 있습니다. Consumer class의 의존성을 숨기고 있어 이 클래스를 사용하고 테스트 하기에는 어렵게 만들고 있습니다. 우리는 클래스의 안을 살펴보지 않으면 어디에 의존하는지를 확인할 수 없습니다.

-  초기화를 관리하기 위한 Component class가 없습니다. 즉 MessageClient 는 MessageService가 이미 Locator에서 사용가능한 상태라고 가정해야합니다.

-  재사용성 : 만약 다른 프로젝트의 모듈에서 재사용한다면 같은 Service Locator를 사용할 수 있을까요?

이러한 이유로 개발자들이 Dagger을 여전히 사용합니다. 제 의견으로는 Dagger가 실재로 DI를 위한 해결책에 가깝다고 생각합니다. 만약 우리가 Dagger를 잘 사용한다면 가장 좋은 선택이곘지요. 하지만 Koin이 있기 떄문에 어떻게 될지 모릅니다.  결과와 효율성 사이의 비용이 중요하기 때문입니다. 제 관점에서 Koin 사용의 가장 큰 문제는 Dependency Injection과 Service Locator의 개념을 잘못 이해하고 사용한다는 것입니다. 

## TL;DR

Koin은 Dependency Injector 가 아니고 Service Locator 이고 anti-pattern 으로 여겨집니다. 이를 알고 사용한다면 Koin은 여전히 가치가 있습니다. 