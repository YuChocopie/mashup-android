---
title: "Transformation map과 switchMap"
date: "2021-08-31"
tags: ["mash-up", "Transformation.map","Transformation.switchMap"] 
description: "Transformation.map과 Transformation.switchMap에 대해서 알아봅니다."
cover: "./images/tumbnail.png"
---

> LiveData를 조금 더 유연하고 확장성 있게 사용하는 방법을 알아봅니다.

## LiveData
먼저 Transformation.map과 Transformation.switchMap에 대해서 알기 전에 알아두어야 할 것이 있습니다.
바로 LiveData와 MediatorLiveData 입니다.

먼저 올라온 포스트에 준비님께서 LiveData의 장점을 아주 잘 설명해주셨는데,
그 장점중에서 LiveData가 Inactive 상태, Activity가 Backstack에 있는 듯한 상태에서는
LiveData의 이벤트를 받지 않는 것에 대해서 부터 이야기 해보겠습니다.

LiveData는 onActive()와 onInActive()라는 메소드를 가지고 있는데, 이는 활성화된 옵저버가
0과 1사이로 변하는 것을 알림 받는 메소드입니다. 이는 LiveData를 관찰하고 잇는 옵저버 수를
의미하는데, 이 옵저버는 onActive()일 때 관찰중 임을 나타냅니다. 그렇다면 언제 관찰중일까요?
바로 Lifecycle.State가 STARTED 일때와 RESUMED 일 때입니다. 그래서 LiveData는 활성상태가
아닐 때 데이터를 업데이트 할 경우 갱신이되지 않을 수 있습니다.

![](https://images.velog.io/images/seokzoo/post/e031b292-00d6-4170-825f-2188fe5a87c5/image.png)

Livedata에 postValue를 A,B,C,D를 해주었지만, onStop일 때 C와 D가 들어갈 경우, 마지막 값인 D만 onResume때 갱신이 됩니다. 이는 onInactive(), 즉 비활성화 상태일 때 값을 업데이트 했기 때문입니다.

실제로 LiveData.java 내부를 보면 sholdBeActive() 메소드를 통해 onStateChanged() 내부에서 activeStateChanged() 메소드에 boolean 값을 던져줍니다.

![](https://images.velog.io/images/seokzoo/post/c2d42e41-8264-49ef-a20c-585f6381757e/image.png)

그리고 activeStateChanged() 메소드에서는 위에서 shoudBeActive()에서 현재 Lifecycle의 Owner의 현재 Lifecycle State를 얻어와 그 State가 STARTED, RESUMED인 경우 True, 아닌 경우 False를 리턴해줍니다. 
True 또는 False 값을 하단의 메소드 activeStateChanged()의 파라미터인 newActive의 값으로 전달해줍니다. 

![](https://images.velog.io/images/seokzoo/post/31786bef-bf4d-49e0-b18e-7e24e7a37946/image.png)

이를 통해 현재 상태와 새로들어운 newActive상태가 같다면, 즉 옵저버의 수가 같다면 즉시 return해주고, 다른 경우 mActive에 newActive값(boolean)을 넣어줍니다. 그리고 changeActiveCounter()에서 mActive값에 True이면 1 , False이면 -1을 넣어줍니다. 이를 통해 옵저버의 개수를 증가 시키거나, 감소시켜줍니다.

 ![](https://images.velog.io/images/seokzoo/post/a689995b-2423-4bb3-9292-f306d327d26d/image.png)

그리고 changeActiveCounter() 메소드를 통해 현재 옵저버의 ActiveCount를 통해 onActive(), onInactive() 메소드를 수행합니다. (이전에 말했던 활성화 된 옵저버의 수를 0~1일 때 구분)

## MediatorLiveData
지금까지는 LiveData에 대해 알아봤다면, 이제는 MediatorLiveData입니다. 
MediatorLiveData를 이용하면 하나 이상의 LiveData를 Observe할 수 있습니다. 즉 서로 다른 Data soure 들이 독립적으로 존재할 때, 따로따로 관찰하는 것이 아닌, 한번에 관찰할 수 있습니다.
```java
LiveData liveData1 = ...;
LiveData liveData2 = ...;

MediatorLiveData liveDataMerger = new MediatorLiveData<>();
liveDataMerger.addSource(liveData1, value -> liveDataMerger.setValue(value));
liveDataMerger.addSource(liveData2, value -> liveDataMerger.setValue(value));
```
위의 예제를 보면 MediatorLiveData를 하나 만든 뒤 liveData1, liveData2를 addSource해 주면 Observe중인 것 중 어느 하나라도 업데이트가 되면, 값이 변경됩니다.

또한 liveData1이 10개의 값만 제출하여 liveDataMerger에 병합되고 싶다면, 아래와 같이도 가능합니다.
```java
liveDataMerger.addSource(liveData1, new Observer() {
      private int count = 1;

      @Override public void onChanged(@Nullable Integer s) {
          count++;
          liveDataMerger.setValue(s);
          if (count > 10) {
              liveDataMerger.removeSource(liveData1);
          }
      }
 });
```
addSource를 하게되면 내부코드에서도 나타나지만, 일반 LiveData처럼 active상태일 때만 관찰하지 않습니다. addSource에서 plug() 메소드를 호출하는데, plug() 메소드는 observeForever()를 실행합니다. 이는 백그라운드에서도 LiveData가 동작합니다. 하지만 observeForever()만 해줄경우 DESTROYED에서 자동으로 Observe를 해제할 수 없습니다. 따라서 적절한 시기에 removeObserver()를 호출해주어야 합니다.

## Trnasformation.Map, switchMap

```java
Transformation.map()

LiveData<User> userLiveData = ...;
LiveData<String> userName = Transformations.map(userLiveData, user -> {
    user.name + " " + user.lastName
});

-------------------------------------------------------------------
Transformation.switchMap()

private LiveData<User> getUser(String id) {
  ...;
}
LiveData<String> userId = ...;
LiveData<User> user = Transformations.switchMap(userId, id -> getUser(id) );
```
혹시 두 함수의 가장 큰 차이점은 무엇일까요? 바로 안의 람다 함수의 리턴 값이 map은 void형, switchMap은 LiveData입니다. 한번 내부도 볼까요?

## map
![](https://images.velog.io/images/seokzoo/post/2766f21f-61d0-4451-a10a-48d507c80a77/image.png)

map함수의 구현부입니다! map은 먼저 제네릭 메소드로 만들어졌으며, 리턴 값은 LiveData입니다. 위의 예시로보면, User형의 userLiveData를 첫 인자로 넘겨주고, 결과 값으로 String형의 LiveData를 리턴 받습니다. 
파라미터로 LiveData형의 source, 두 번째 파라미터로 함수를 받고 있는데요, 보이는 Function<X,Y>는 X를 받아 Y로 반환해주는 함수입니다. MediatorLiveData로 만든 변수 result가 있으며, result에 addSource를 통해 인자로 받아온 source와 옵저버를 달아줍니다. 후에 source값의 변경이 있을 경우 onChanged() 메소드가 실행되어 result에 setValue를 통해 mapFunction, 즉 파라미터에서 받아온 X를 Y로 변환해주어 result의 값을 바꾸어줍니다. 
이해하기 쉽게 말하자면 LiveData X를 LiveData Y로 바꾸어주는, 매핑해주는 함수입니다!

## switchMap
![](https://images.velog.io/images/seokzoo/post/3426472b-89b0-4df7-805f-87e0fd496db6/image.png)

이는 siwtchMap의 구현부입니다! 이전의 map보다 onChanged() 메소드가 훨씬 길어졌지만, 잘 읽어보면 크게 다른점은 없습니다. 똑같이 source가 변경되면 그 값을 변경해줍니다. 하지만 이전의 map과의 차이라면 두 번째 파라미터 함수에서의 리턴값이 map은 object였지만, 이번 switchMap은 리턴값이 LiveData입니다. 

## 정리
이러한 Transformations를 잘 이용한다면 일반 LiveData만 이용했을 때보다 훨씬 유연하고, 간편하게 코드를 작성할 수 있습니다. 이를 잘 활용하여 클린코드로 거듭나보시길 바랍니다.