---
title: "Android EventBus"
date: "2022-08-28"
tags: ["Android", "minuk", "eventbus", "mash-up"]
description: "데이터 공유 이제는 쉽게, EventBus로"
cover: "./minuk.png"
---

# Event Bus

안녕하세요 Mash-Up 안드로이드 10기 양민욱입니다 :)

Activity, Fragment, 혹은 Service 간의 데이터 송수신. 여러분들은 어떤 방식을 사용하고 있으신가요? intent, bundle부터 Receiver, ViewModel까지 다양한 방법들이 머릿속에 떠오르실 거라 생각이 드는데요. 

제가 오늘 소개해드릴 `EventBus` 라이브러리는 역시 Android 내에서 데이터를 공유하는 방법의 하나입니다. 저도 입사 전에는 전혀 모르고 있던 라이브러리인데요. 회사 내에서 여러 프로젝트를 개발할 때 EventBus 라이브러리 덕분에 쉽고 빠르게 개발을 완료할 수 있었던 좋은 기억들이 많아서 오늘 간단한 **사용 방법**과 현업에서 어떻게 사용하고 있는지 소개해보려고 합니다.

# [EventBus](https://github.com/greenrobot/EventBus)

EventBus는 **publisher/subscriber 패턴**으로 구현된 쉽게 데이터를 송수신할 수 있는 Java 기반의 Android 오픈 소스 라이브러리입니다. 

첫 배포 버전인 1.0.1은 놀랍게도 2012년에 출시가 되었으며 현재까지도 계속 유지보수가 되고 있습니다 🙂

## 사용 방법

### 1 Step. 이벤트 타입 정의하기 (Option)

```kotlin
sealed class Event {
  data Push(val payload: String): Event
  data ADialog(val aData: A): Event
}
```

EventBus를 통해 주고받을 데이터 타입을 정의합니다. 따로 이벤트 타입을 정의하지 않고 `Any` 타입으로 모든 데이터를 수신받게 구현해도 좋습니다.

### 2 Step. 이벤트  Subscriber 등록하기

이번 Step에서는 `@Subscribe` 어노테이션을 가진 함수를 클래스 내에 정의합니다. Android에서는 일반적으로 **Activity, Fragment 클래스에서 선언**하여 메모리 효율성을 위해 Lifecycle에 맞춰서 등록 및 해제를 하는 것이 좋습니다.

1) 여러 개의 Data Type

```kotlin
@Subscribe(threadMode = ThreadMode.MAIN)  
fun onMessageEvent(event: Event) {
    // this method will be called when a Event Data is posted
}

@Subscribe(threadMode = ThreadMode.MAIN)  
fun onMessageEvent(anotherEvent: AnotherEvent) {
    // this method will be called when a AnotherEvent Data is posted
}
```

2) Any or Seald Class

```kotlin
@Subscribe(threadMode = ThreadMode.MAIN)  
fun onMessageEvent(event: Any) {
    // something
}

or 

@Subscribe(threadMode = ThreadMode.MAIN)  
fun onMessageEvent(sealedEvent: SealedEvent) {
    when (sealedEvent) { ... }
}
```

**Subscribe 등록 및 해제**

```kotlin
@Override
 public void onStart() {
     super.onStart();
     EventBus.getDefault().register(this)
 }

 @Override
 public void onStop() {
     super.onStop();
     EventBus.getDefault().unregister(this)
 }
```

### 3 Step. Event를 EventBus로 방출

```kotlin
EventBus.getDefault().post(Push("TEST"))
```

---

## 추가 기능

### **ThreadMode**

| ThreadMode.MAIN | Android Ui Thread에서 실행을 보장 |
| --- | --- |
| ThreadMode.POSTIONG | Event를 전달한 Thread에서 실행 |
| ThreadMode.MAIN_OERDERED | Android Ui Thread에서 실행되며 여러 데이터가 한꺼번에 전달될 때 실행되는 순서를 보장합니다. |
| ThreadMode.BACKGROUND | Background Thread에서 실행 |
| ThreadMode.ASYNC | 실행될 때마다 별도의 Thread를 만들어 실행, Thread Pool 관리를 통해 다수의 비동기 실행을 효율적으로 실행 |

ThreadMode 이외에도 우선순위 등 여러 가지 설정을 줄 수 있는데요. 추가로 궁금하신 분들은 [공식 문서](https://greenrobot.org/eventbus/documentation/)에서 찾아보시면 좋을 것 같아요 🙂

### ****Sticky Events****

```kotlin
@Subscribe(sticky = true, threadMode = ThreadMode.MAIN)
fun onEvent(event: Event) {   
}
```

기본적으로 EventBus에 전달되는 데이터들은 휘발성 데이터로 구독자에게 한번 전달하고 사라집니다. 

Sticky Event는 마치 StateFlow처럼 마지막으로 전송되었던 값을 저장하고 있어 새로운 구독자가 생성될 경우 저장하고 있던 데이터를 전달합니다!

```kotlin
EventBus.getDefault().removeStickyEvent(stickyEvent)
```

저장하고 있던 데이터 지울 수도 있습니다 :)

---

## 사용 사례

### Base Class에서 등록 및 해제하는 코드를 재사용하면서 공통 이벤트 처리

```kotlin
abstract class BaseActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        LazyEventBus.register(this)
				...
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    open fun onEventMainThread(eventObject: Any) {
        if (eventObject is LazyEventObject) {
            when (eventObject.typeId) {
                LazyEventObject.SETTING_IN_RESPONSE_RECEIVED -> {
                    ...
                }
                LazyEventObject.APP_UPDATE_REQUIIRED -> {
                    ...
                }
                LazyEventObject.AUTHTOKEN_INVALID -> {
                    ...
                }
                LazyEventObject.TOOK_SCREEN_SHOT -> {
                    ...
                }
                LazyEventObject.UPDATE_AVAILABLE -> {
                    ...
                }
            }
        }
        if (eventObject is ManagerPushEvent) {
            ...
        }
    }
    ...

    override fun onDestroy() {
        super.onDestroy()
        LazyEventBus.unregister(this)
    }
    ...
}
```

저희 회사 앱은 이벤트 즉 데이터를 언제 어디서 올지 모른다는 전제 조건하에 **BaseActivity** 내에서 onCreate Lifecycle에서 EventBus를 등록해주고 onDestory Lifecycle에서 EventBus 등록 해지를 해주고 있습니다 :)

또한 **onEventMainThread** 함수를 open 키워드로 선언해서 필요해따라서 각 화면에서 오버라이드를 통해 재정의하고 있습니다.

### In App 데이터 공유

```kotlin
LazyEventBus.post(newPushEventOfGoTab(UserMainActivity.UserTab.Schedule.index))
```

EventBus를 object로 wrapper해서 하나의 인스턴스로 관리하기 때문에 이벤트를 앱 모든 곳에서 공유하고 전달할 수 있어요!  

예를 들어

- 특정 depth가 깊은 뷰에서 Activity로 바로 데이터를 전달하고 싶을 때
- Fcm 푸시가 알림이 목적이 아닌 현재 화면 갱신이나 특정 화면으로 이동하려는 액션 이벤트의 경우
- api 통신 결과가 토큰 만료일 때 등등 data layer에서 전달

## 마치며..

아쉽게도 EventBus는 뛰어난 장점을 가진 것도 아키텍처 관점으로 좋은 구조를 제공해준다고 장담할 수는 없습니다. 다만 사용해보면서 느낀 점은 어렵지 않은 사용 방법과 데이터 공유를 위한 보일러 플레이트 코드를 많이 지울 수 있어서 사이드 프로젝트 등의 작은 규모에서는 적용해도 괜찮은 라이브러리라고 생각됩니다.

지금까지 어떤 구조로 동작하는지, 회사에서 어떻게 사용하고 있는지 등 간단한 저의 경험을 토대로 소개해보았는데요!

- 이런 점은 좋아요.
- 이런 점은 개선할 수 있을 것 같아요

등 여러분들의 생각이나 의견을 주신다면 더욱 좋을 것 같습니다 :)