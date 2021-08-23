---
title: "Rxjava Observable 만들어보기!"
date: "2021-01-06"
tags: ["mash-up", "jsh-me", "rxjava", "observable", "android"]
description: "Rxjava Observable을 만들어보아요."
cover: "./ic_rxjava.png"

---



## Rxjava Observable 만들어보기 

안녕하세요! mash up 10기 안드로이드 팀 정세희라고 합니다 : ) 이번 mash up 안드로이드 팀에서는 Rxjava를 공부해보고 질의응답 해보는 시간을 가져봤는데요! 제일 기본적인 Observable 을 만들어보는 것에 대해 포스팅하도록 하겠습니다.



<p align="center">
  <img src="https://user-images.githubusercontent.com/39688690/103771599-5c962a80-506b-11eb-9759-cab42e50782d.jpg" width="50%">
  <br>
  두근두근~
</p>

<br>

**Observable** 은 **Observer** 가 관찰하는 대상입니다. 데이터 갯수와 상관없이 상태 변화가 발생할 때 Observer에게 변화를 전달할 수 있습니다. 대표적으로 onClick과 같은 클릭리스너가 대표적은 Observer 패턴의 예시입니다. Observable은 기본적으로 세가지 알림을 Observer에게 전달합니다.

​	Q. 그럼 Observable 과 Observer 가 도대체 뭔가요 ?!

​	A. **Observable** 의 의미인 '관찰 할 수 있는'에 집중해보면 쉽게 와닿을 수 있습니다. 👀 Observable은 어떤 데이터를 **Observer**가 처리할 수 있도록 포장하는 작업을 담당한다고 보면 됩니다!  '관찰자'의 의미에서 보면 **Observer** 는 Observable에서 관찰 할 수 있는 형태로 전달한 데이터를 받고 이에 대한 행동을 취합니다. 



<img src="https://t1.daumcdn.net/cfile/tistory/99D4D7415D4E552B20" alt="img" style="zoom:100%;" />

위 그림을 보면 **Observable** 이 onNext, onComplete, onError 같은 함수를 통해 Observer에게 무언가를 전달하고 있는 것을 볼 수 있습니다. onNext는 데이터를 포장할 때마다 Observer에게 완료된 작업물을 전달하는 것이고 onComplete는 포장 작업이 끝날 때 호출하는 함수, onError는 Observable 내에서 어떤 문제가 생겼을 때 호출되는 함수입니다.



<img src="https://user-images.githubusercontent.com/39688690/103770082-c52fd800-5068-11eb-92e4-8ef32d2bbf0e.png" alt="image" style="zoom:20%;" />



데이터를 가장 쉽게 발행하는 방법으로는 just() 를 사용하면 됩니다. just() 는 최대 10개까지의 데이터를 넣어서 발행할 수 있습니다. 즉 데이터를 넣으면 바로 방출될 수 있다는 말인데요. 그만큼 무거운 연산을 제어하게 될 때는 just() 를 지양하는 것이 좋습니다.

<img src="https://user-images.githubusercontent.com/39688690/103770158-e2fd3d00-5068-11eb-85f2-f183f1bd2272.png" alt="image" style="zoom:20%;" />

Observable은 누군가 명시적으로 아이템을 구독(subscribe)하기 전까지는 아이템을 발행하지 않습니다. 그래서 내가 구독을 원하는 시점에 subscribe() 함수를 사용사용하여 아이템을 발행하기 시작합니다 : ) 

subscribe 는 아래와 같이 4개의 코드 형태를 가지고 있으며 반환형은 모두 Disposable입니다. onNext, onError, onComplete 이벤트가 발생되었을 때 행동을 코드로 적을 수 있습니다.

<img src="https://user-images.githubusercontent.com/39688690/103770289-15a73580-5069-11eb-9b90-dd0e5f5741c4.png" alt="image" style="zoom:20%;" />



**Disposable** 은 dispose, isDisposed 함수를 가지고 있습니다. 

dispose() 는 데이터를 더이상 구독하지 않을 때, 해지하기 위한 함수인데요. observable 이 onComplete 를 호출하게 되면  dispose()가 호출이 되어 Observable은 Observer와의 관계를 끊게 됩니다. 

**그럼 언제 사용해야 할까?** 라고 한다면, 많은 경우의 수가 존재하겠지만 대표적인 예로는 

1. 새로운 작업을 진행 할 때 이전 작업을 취소하는 경우
2. 화면을 떠날 때 진행 하던 작업을 취소하는 경우가 있을 수 있습니다.



하지만 observable 이 dispose()를 부르지않는 경우가 있습니다.

다음과 같은 함수가 정의되어 있을 때를 예시로 들어보겠습니다.

<img src="https://user-images.githubusercontent.com/39688690/103770378-425b4d00-5069-11eb-88e0-60cd73425448.png" alt="image" style="zoom:20%;" /><br>

만약 앱이 비정상 종료가 되었을 때, 현재 onNext 에서는 텍스트뷰를 참조하기 때문에 가비지 컬렉션의 대상이 되지 못하고, 결국 메모리 누수 발생하게 됩니다. 보통 가비지 컬렉터가 메모리에서 객체를 제거할 수 없으므로 라이프사이클에 맞게 참조를 끊어야 사용하지 않는 메모리를 해제할 수 있습니다.  그래서 제대로된 해제를 위해 disposable 인터페이스를 이용하여 명시적으로 자원을 해제하는 경우를 사용하게 됩니다. 즉, subscribe() 함수를 호출하면 disposable 객체에 담고, onDestroy() 메소드에서 메모리 참조를 해제하도록 구성하는 형태가 됩니다.

<img src="https://user-images.githubusercontent.com/39688690/103770494-720a5500-5069-11eb-93a6-a72beda7ceda.png" alt="image" style="zoom:20%;" />

<br>

앞서 보았던 just()는 데이터를 넣으면 바로 발생이 가능하지만 create()는 onNext, onComplete, onError 를 개발자가 직접 구현해주어야 합니다. 구독 해지되었을 때 등록된 콜백을 모두 해제 해주어야 하고, 구독자가 구독하는 동안만 onNext, onComplete 를 호출해야 합니다. 이처럼 모든 것을 다 개발자가 처리해주어야 하기 때문에 다른 연산자보다 잘 사용해야 한다는 점!

<img src="https://user-images.githubusercontent.com/39688690/103770540-86e6e880-5069-11eb-8286-ff311ea571e1.png" alt="image" style="zoom:20%;" />

<br>

Rxjava2 부터 from()함수를 세분화 되었습니다.  이미 참조할수 있는 배열 및 리스트 등의 자료 구조나 future, callable 또는 publisher가 있다면 from으로 시작하는 연산자를 통해 Obserable로 변환이 가능합니다. fromArray, fromIterable 함수는 파리미터로 배열 또는리스트 에 담긴 데이터를 순서대로 생성하는 연산자이고, 모든 데이터를 순차적으로 송신 후 완료됩니다. 반복적인 데이터 변환 작업 같은 경우 for 문 대신 대체할 수 있습니다. 

Fromarray는 array 를 받아 Observable로만드는 오퍼레이터이고, 

<img src="https://user-images.githubusercontent.com/39688690/103770604-a41bb700-5069-11eb-80b2-688fb0cbb6c6.png" alt="image" style="zoom:20%;" /><br>

Fromiterable은 iterable 을 implement 한 클래스를 파라미터로 받아 Observable을 만드는 오퍼레이터입니다. 

<img src="https://user-images.githubusercontent.com/39688690/103770637-b269d300-5069-11eb-9eb0-603feaee5871.png" alt="image" style="zoom:20%;" />

<br>

Fromcallable 은 이름에서도 알 수 있듯이 기존 자바에서 제공하는 비동기 계산을 할 때 사용하는 Callable 객체를 OBservable형태로 변경합니다. 비동기 작업이면 보통 Runnable 도 떠올릴 수 있습니다. 둘의 차이점은 Runnable을 통해서는 값을 return 받을 수 없는 구조이고, Callable 은 실행 결과를 리턴할 수 있습니다. 이 점을 이용하여 실행 결과를 Observable로 변경할 수 있는 것입니다. fromFuture 또한 자바에서 제공하는 future 객체를 Observable로 변환합니다.fromCallable과 차이점이 있다면 fromFuture은 결과값을 받을때까지 블로킹 한다는것입니다.

<img src="https://user-images.githubusercontent.com/39688690/103770793-eba24300-5069-11eb-8452-cb7e079f081d.png" alt="image" style="zoom:20%;" />

<br>

**single** 은 오직 1개 데이터를 전달하는 생산자입니다. 결과가 유일한 서버 API를 호출할 때 사용합니다. 중요한 것은 데이터 하나가 발행과 동시에 종료된다는 점 입니다. 데이터 하나만 발행하는 것을 보장하기 때문에 그 이상 보낼 때는 에러가 발생하게 됩니다. 그래서 데이터를 하나만 보낼 수 있도록 변환할 수 있는 operator 도 많이 존재합니다.

<img src="https://user-images.githubusercontent.com/39688690/103770847-096fa800-506a-11eb-8e3e-d14c009e8bdb.png" alt="image" style="zoom:20%;" />

<br>

**maybe** 는 0개 혹은 1개의 데이터를 전달하는 생산자입니다. Single 클래스에 Oncomplete 이벤트가 추가된 형태라고 보면 됩니다.

<img src="https://user-images.githubusercontent.com/39688690/103770911-2015ff00-506a-11eb-8e77-5cb3727050f7.png" alt="image" style="zoom:20%;" />

<br>

사실 Observable에는 **Cold Observable** 과 **Hot Observable** 이 존재하게 됩니다. Cold Observable은 Observable을 선언하고 함수를 호출해도, subscribe() 함수를 호출해서 구독하지 않는다면 데이터를 발행하지 않는다면, Hot Observable은 구독자의 존재 여부와 상관없이 데이터를 발행하는 Observable입니다. 그래서 여러 구독자들을 고려할 수 있습니다. 하지만 반대로 생각해본다면 구독자의 입장에서는 모든 데이터를 받을 수 있다는 보장이 없습니다.

다시 말하자면 Cold Observable은 구독하면 준비된 데이터를 처음부터 발행하지만 Hot Observable은 구독한 시점부터 Observable에서 발행한 값을 받게 되는 것입니다.



<img src="https://user-images.githubusercontent.com/39688690/103771005-4f2c7080-506a-11eb-82fc-b39a3334ccca.png" alt="image" style="zoom:20%;" />



**Subject** 는 앞서 말했듯이 Cold Observable을 Hot Observable로 변경해줍니다. Observable과 Observer의 성격을 둘 다 가지고 있는 클래스입니다.

첫번째로 볼 것은 **Asyncsubject** 입니다. Complete가 되면 가장 마지막 데이터를 받는 형태입니다. 즉, 완료되기 전까지는 구독자에게 데이터를 전달하지 않다가, 완료와 동시에 발행해주고 종료합니다.<br> ✨ 완료되기 전 데이터에만 관심이 있습니다! ✨

<img src="https://user-images.githubusercontent.com/39688690/103771092-73884d00-506a-11eb-891c-f3e031c31e57.png" alt="image" style="zoom:20%;" />

<br>

**BehaviorSubject** 는 구독을 한 시점부터 가장 최근 값을 반환해주는 클래스입니다. 만약에 구독 시점에 최근 값이 없다면 기본값을 넘겨주기 때문에 초기에 default 값을 정해주게 됩니다.

<img src="https://user-images.githubusercontent.com/39688690/103771157-8e5ac180-506a-11eb-85dc-9def9fdaab1e.png" alt="image" style="zoom:20%;" />



<br>

**PublishSubject** 구독을 한 시점부터 데이터를 발행합니다. 발행한 값이 없을 땐 기본값 대신 발행하지 않습니다.

<img src="https://user-images.githubusercontent.com/39688690/103771227-a8949f80-506a-11eb-9e1d-7e911026ae85.png" alt="image" style="zoom:20%;" />



<br>

**Replaysubject** 는 구독을 한 시점과 상관없이 항상 데이터의 처음부터 끝까지 발행하는 것을 보장해줍니다. 그래서 Cold Observable 처럼 작동합니다. 데이터의 처음부터 끝까지 발행해주기 때문에 메모리 누수의 가능성을 염두해야 합니다.

<img src="https://user-images.githubusercontent.com/39688690/103771277-c3ffaa80-506a-11eb-9e2c-904c72055270.png" alt="image" style="zoom:20%;" />

<br>

**ConnectableObservable** 클래스는 Observable을 여러 구독자에게 공유할 수 있으므로 원 데이터 하나를 여러 구독자에게 동시에 전달할 때 사용합니다. 특이한 점은 subscribe()함수를 호출해도 아무런 동작이 일어나지 않는다는 점입니다. 왜냐면 새로 추가된 connect() 함수가 호출한 시점부터 subscribe()함수를 호출한 구독자에게 데이터를 발행하기 때문입니다. ConnectableObservable 객체를 생성하기 위해 **publish()** 함수를 먼저 호출합니다. 후에 여러 구독자들에게 데이터를 발행하기 위해 **connect()** 함수를 호출합니다. connect() 함수를 호출하기 전까지는 데이터의 발행을 미루는 것입니다. :) 

<img src="https://user-images.githubusercontent.com/39688690/103771352-eee9fe80-506a-11eb-9076-e719260be25f.png" alt="image" style="zoom:20%;" />

<br><br><br>
