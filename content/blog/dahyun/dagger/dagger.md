---
title: Dagger - Raw Dagger
date: "2020-12-27"
tags: ["dagger", "mash-up", "dahyun","Android"]
description: "Raw Dagger에 대해 알아봅시다.."
cover: "./dagger1logo.png"
---

# **Dagger - Raw Dagger**

이번에는 제가 프로젝트에 적용하며 공부해본 `Dagger2`에 대해 복습하는 겸! 해서 글을 작성해 보겠습니다. (이하 Dagger)

Dagger는 리플렉션을 사용하지 않고 런타임에 바이트코드도 생성하지 않는것을 특징으로 가지는 Android의 DI 라이브러리입니다.

DI란 무엇인가?에 대해서는 일단 알고 있다고 가정하겠습니다.

흔히 다른 DI 라이브러리라고 알려지는 `Koin`과 비교되는데 `Koin`은 정확히 말하자면 DI 라이브러리는 아닙니다. `Koin`은 `Service locator`라는 패턴이고, 이와 관련해서는 [진성님의 글을 참조하도록 합시다.](https://mashup-android.yuchocopie.vercel.app/blackjin/post3/dependency-injection-service-location/)

아무튼 이런 Dagger는 보일러 플레이트 코드를 없애는 나름의 단계를 거친다고 할 수 있습니다. (완전히 자의적으로 정한 단계입니다!) 

어떠한 것을 배우는 입장에서는 하나하나 단계를 밟고 나서야 마지막으로 보일러 플레이트 코드를 제거한 단계를 사용하는 게 맞다고 생각합니다. 

그래야 가장 올바르게 사용할 수 있겠죠? 최종 목적이라고 할 수 있는 Hilt를 보다 잘 사용하기 위해서는 Dagger 의 본질부터 차근차근 해봅시다.

그럼 나름대로 나눈 단계를 알아봅시다.

1. Raw Dagger (쌩 대거)

2. Android Injection 적용

3. @ContributesAndroidInjector 사용

4. Dagger Base 적용

5. Hilt 사용

이렇게 단계를 나눠볼 수 있습니다..!

이번 첫 번째 글에서는 기본적인 `Raw Dagger`를 사용하는 법을 배워보도록 하겠습니다. 

프로젝트에 gradle등 Dagger 설정하는 부분은 넘어가고 이해에 중점을 맞춰서 써보겠습니다.

이후 글들에서는 보일러 플레이트 코드를 점진적으로 제거해보도록 하겠습니다..!

___

Dagger는 여러 어노테이션을 사용합니다! 차근차근 알아봅시다.

하나하나 이해하기보다는 다 연계해서 이해하는게 좋다고 생각합니다.

가장 중요한 4가지 어노테이션은 다음과 같습니다. 뒤에 더 자세히 알아보기 전에 느낌만 알고 갑시다.

@Compenent: 실제 의존성 주입이 구현될 인터페이스나 추상클래스에 사용되는 annotation 입니다.

@Module : 의존성 관계를 설정하는 클래스에 사용되는 annotation 입니다. 컴포넌트에서 어떤 모듈을 사용할지 설정합니다.

@Provides : 객체를 제공하기 위한 메서드에 달아주는 annotation 입니다. 모듈 안에서 사용됩니다.

@Inject : DI를 진행할 멤버변수와 생성자에 달아줍니다. 

이외에도 많은 어노테이션이 있습니다.

## 실제로 주입되는 녀석들은 어디에 있는가? - @Module, @Provides, @Binds

Dagger는 컴파일 타임의 의존성 주입에 필요한 애노테이션을 읽고 의존성 주입에 필요한 클래스 파일들을 생성합니다. 

@Module과 @Provides, @Binds 애노테이션을 읽고 의존성 주입에 필요한 파일들을 생성합니다.

다음 코드는 간단한 모듈과 그 안에 있는 @Provides입니다.

~~~kotlin
@Module
abstract class DatabaseModule {

    companion object {
        @Singleton
        @Provides
        fun providesFamilyMemberDatabase(context: Context): FamilyMemberDatabase =
            FamilyMemberDatabase.getInstance(context)
    }
}
~~~

간단하게 설명하자면, @Module은 의존성을 제공하는 클래스, @Provides, @Binds는 의존성을 제공하는 메서드에 붙인다고 생각하면 됩니다. 

다음 코드는 @Binds의 예시입니다.

~~~kotlin
@Module
abstract class StorageModule {

    @Binds
    abstract fun provideStorage(storage: SharedPreferencesStorage): Storage
}
~~~

그럼 @Provides와 @Binds의 차이는 뭘까요?

@Binds는 모듈 내의 추상 메서드에 붙일 수 있으며, 반드시 하나의 매개 변수만을 가져야합니다. 좀 더 효율적으로 사용할 수 있지만, 단일 매개변수만 허용한다는 점이 다릅니다. 다음 조건들을 만족해야한다는 이야기입니다.

그렇다면 @Provides는 인스턴스 만드는 법이 나와있다고 할 수 있는데, @Binds는 그냥 저렇게만 하면 인스턴스가 만들어지나요? 라는 의문이 나올 수 있습니다. 

여기서 @Inject가 쓰입니다. 이때는 생산자에 쓰인 @Inject로 인스턴스 만드는 법을 알게 됩니다!
~~~kotlin
class RegistrationViewModel @Inject constructor(val userManager: UserManager) {
    ...
}
~~~

같은 모듈에서 사용하고 싶다면? @Provides에 static을 해야합니다.

[이 글을 참고해봅시다.](https://dagger.dev/dev-guide/faq.html)

@Binds를 쓰면 코드를 40퍼센트 정도가 줄어든다고 합니다!

<p align="center">
<img src="pvsb.png" width="80%">
<br>생성되는게 다르다!<br/></img></p>
___

쉽게 정리하자면, @Binds는 @Provides에 비해 `제한적`이지만 `쉽게` 주입해줄 수 있습니다. 아래 5가지 규칙이 바로 `제한`이라고 할 수 있습니다. @Provides의 오버헤드를 줄이기 위해서 만들어졌다! 라고 봐도 괜찮을 듯 싶습니다.

1. The module class must be abstract
2. The method must be abstract and has no method body
3. There should only be one method parameter
4. The parameter must be assignable to the return type
5. The parameter must have an @Inject annotated constructor

그러나 Module 클래스 하나만으로는 별도의 클래스 파일이 생성되지는 않습니다! @Component가 등장할 차례입니다.

## 주입해주기 위한 껍데기 Component!

기본 틀은 @Component(modules = [MyModule::class])과 같은 방식으로 모듈을 포함시켜줍니다.

이 컴포넌트는 Dagger와 @Component가 붙은 클래스 이름이 합쳐진 형식의 이름으로 생성됩니다.

컴포넌트가 붙은 모든 타입은 최소한 하나의 추상적인 메서드를 가져야 합니다. 메서드의 이름은 상관 없습니다.

컴포넌트 메서드는 프로비전 메서드와 멤버-인젝션 메서드로 구분됩니다.
~~~kotlin
@Component(modules = [MyModule::class]) 
interface MyComponent {
     fun getClassB() : ClassB 
}
// 프로비전 메서드 
~~~
~~~kotlin
@Component(modules = [MyModule::class]) 
interface MyComponent { 
    fun injectSomeType(classB: ClassB) 
}
// 멤버 인젝션 메서드 
~~~
다음은 액티비티의 onCreate에서 액티비티를 주입해주는 예시입니다.
~~~kotlin
// 자동 생성되는 DaggerAppComponent
@Singleton
@Component(
    modules = [DatabaseModule::class,
        AppSubComponents::class,
        ...]
)
interface AppComponent {
    @Component.Factory
    interface Factory {
        fun create(@BindsInstance context: Context): AppComponent
    }

    fun mainComponent(): MainComponent.Builder
    ...
}
~~~
~~~kotlin
// DaggerAppComponent에 접근해서 build 해줄 수 있다.
@Subcomponent(modules = [MainModule::class])
interface MainComponent {

    @Subcomponent.Builder
    interface Builder {
        @BindsInstance
        fun setActivity(activity: MainActivity): Builder
        fun build(): MainComponent
    }

    fun inject(activity: MainActivity)
    fun contactComponent(): ContactComponent.Builder
}
~~~
~~~kotlin
component = DaggerAppComponent.factory().create((application as FamilyLoveNotification))
    .mainComponent()
    .setActivity(this).build()
component.inject(this) // 최종적으로 액티비티에 주입해준다.
~~~
예시니까 전체적인 흐름을 보시면 좋을 것 같습니다.
___
@Component는 만드는 법을 따로 지정할 수 있습니다. (미 지정시 빌더를 사용한다고 합니다.) 그 만드는 법은 빌더 방식과 팩토리 방식 2가지로 나뉘어집니다. 아래 코드를 보시면 어려울 것은 없습니다. (위의 코드도 팩토리 방식, 빌더 방식을 사용했음을 볼 수 있네요)

컴포넌트의 빌더의 세터 메서드 혹은 팩토리의 매개변수에 붙일 수 있는데, 이는 따로 컴포넌트를 만들 때 넣어주어야 합니다. 

여기서 @BindsInstance 어노테이션도 사용할 수 있습니다!

~~~kotlin
@Component(modules = [StorageModule::class])
interface AppComponent {

    @Component.Factory
    interface Factory {
        fun create(@BindsInstance context: Context): AppComponent
    }

    fun inject(activity: RegistrationActivity)
}
// 팩토리 방식
~~~
~~~kotlin
@Subcomponent(modules = [DetailModule::class])
interface DetailComponent {
    @Subcomponent.Builder
    interface Builder {
        @BindsInstance
        fun setActivity(activity: DetailActivity): Builder
        fun build(): DetailComponent
    }

    fun inject(activity: DetailActivity)
}
// 빌더 방식
~~~

이미 컨텍스트는 시스템에서 제공되고 있고, 그럴 때 이렇게 전달이 가능합니다! 이제 context도 graph에서 제공됩니다.

Use @BindsInstance for objects that are constructed outside of the graph - codelab
___

이상으로 Dagger의 기본 사용법을 알아보았습니다. 다음 글에서는 멀티바인딩, 스코프 등 세부적인 내용으로 돌아오겠습니다. 

reference

코드랩
https://developer.android.com/codelabs/android-dagger#0

https://dagger.dev/dev-guide/faq.html

책 - 아키텍처를 알아야 앱 개발이 보인다