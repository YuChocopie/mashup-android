---

title: "Jetpack Navigation"

date: "2021-01-10"

tags: ["huijiny", "mash-up", "jetpack", "navigation"]

description: "Jetpack Navigation에 대해서 알아보자!"

cover: "./희진.png"

---

## Jetpack Navigation



이번에는 Jetpack 에 소개된 Navigation에 대해서 작성해보도록 하려고 합니다:) 이번 개인 프로젝트에서 팀장님께서 써보라고 소개해주셨는데, 처음 보는 개념이여서 공부하는 겸 블로그를 작성해보겠습니다ㅎㅎ



### The Chanllenge of ViewModel Sharing

[Jetpack Navigation][https://developer.android.com/guide/navigation] 은 하나 또는 여러 fragment로 구성된 적은 수의 Activity로  설계된 앱에서 사용가능합니다. 이 아키텍쳐를 선택한 이유들은 Ian Lake의 [Single Activity:Why, When and How](https://www.youtube.com/watch?v=2k8x8V77CrU) 에서 다루고 있는데요,

개인적으로 이해한 것은, 기존 여러개의 액티비티로 이루어져 intent등을 통해 데이터를 주고받거나, 액티비티간의 이동간 생명주기를 신경써야하던 부분이 있었는데, 이를 단일 액티비티 + ViewModel 구조를 통해서 화면전환 및 데이터 송수신 문제를 해결할 수 있는, 앱의 전반적인 구조의 다이어트 및 안정화를 도울 수 있는 정도라고 말할 것 같습니다.

 아래의 화면처럼 Android 내에서 화면 흐름을 시각적으로 볼 수 있을 뿐만 아니라 바로 수정할 수 있기 때문에 편리하다고 합니다.

![img](https://blog.kakaocdn.net/dn/dvNXqo/btqxqJ1E9ro/32b22CiiMt8tIRc0IpgeUK/img.png)



###  Navigation의 기능

- Fragment 트랜잭션을 관리할 수 있다.
- Up, back 버튼의 작업 등(백스택 관리)을 간단하게 처리
- 화면 전환 시, Animation이나 Transition을 위한 표준화된 리소스를 제공
- 딥링크 구현 및 처리

- Navigation UI 패턴을 사용한 Navigation drawers, Bottom Navigation의 연동을 쉽게 구현할 수 있게 지원
- fragment 간의 이동 시 안전하게 데이터를 전달 가능
- Navigation Editor를 통해 화면 흐름을 시각적으로 관리 가능

### Navigation 구성

1. Navigation Graph(New XML Resource)
   <img src = "https://blog.kakaocdn.net/dn/pL1P6/btqK2rNaFAm/tiilMpV2xxUL0ZqYp8i39k/img.png" width="100%">

   내비게이션 그래프는 새로운 리소스 타입이라고 해요. XML 코드로도 확인할 수 있습니다. 각각의 스크린들은 destination이라는 이름을 갖고 있고 가고 싶은 곳으로 연결할 수 있다고 합니다. 그리고 모두 프레그먼트입니다.

2) NavHostFragment(Layout XML view)

   ![img](https://blog.kakaocdn.net/dn/njtax/btqLbmD9BpL/Hqkc4xpP6WKI7aOISQdSO1/img.png)

   프레그먼트 내비게이션을 위한 빈 위젯이라고 생각하면 된다고 합니다.

3. NavController(Kotlin/Java object)

   > findNavController().navigate(<Destination or Action id>)

   말 그대로 내비게이션을 컨트롤 합니다. NavHostFragment는 개별적으로 NavController를 갖고 있어서 내비게이션 그래프 정보를 바탕으로 내비게이션 간 이동 및 액션을 담당한다고 합니다.

### Example

ViewModel을 이용해 activity를 만들면 그 activity의 어떤 fragment이던지 ViewModel을 참조할 수 있습니다.

```kotlin
// Any fragment's onCreate or onActivityCreated
// This ktx requires at least androidx.fragment:fragment-ktx:1.1.0

val sharedViewModel: ActivityViewModel by activityViewModels()
```


이제 single activity 를 만든다고 생각해봅시다. 그리고 8개의 fragment 목적지를 갖고 있습니다. 또한 이는 shopping checkout flow를 4가지 fragment로 갖고 있다고 생각해봅시다.

![Image for post](https://miro.medium.com/max/1634/0*ajyZKgb1Oa3aYQaD)

아래의 4가지 checkout flow 목적지에서는 주소지나, 결제방법, 고객 쿠폰 코드 등의 data를 공유하는 것이 중요합니다. 우리는 이 정보들을 ViewModel에 적어놓습니다. 8개의 fragment는 모두 View Model에 접근할 수 있습니다.

### ViewModel NavGraph Integration

[Navigation2.1.0](https://developer.android.com/jetpack/androidx/releases/navigation#2.1.0-alpha02) 에서는 ViewModel들이 Navigation Graph와 연결되었다고 소개합니다. 실전에서는 onboarding flow, login flow, checkout flow처럼 관련된 목적지의 collection을 모두 가져갈 수 있다는 것인데요, 이게 무슨말이냐면 이 각각의 flow들을 [nested navigation graph](https://developer.android.com/guide/navigation/navigation-nested-graphs) 에 넣는다면 그 화면 사이에서 데이터를 공유하는 것이 가능해진다는 것입니다.(제가 이해하기에는요!)


nested navigation graph를 만들기 위해서는 일단 screen을 클릭하고, right click해서 **Move to Nested Graph -> New Graph:** 를 선택합니다.

![Image for post](https://miro.medium.com/max/1196/1*o6KYHXaP9HbHR5SQEviXgg.png)

XML에서는 nested navigation graph의 **id** 적습니다. 이 경우에는 `checkout_graph`입니다.

```kotlin
<navigation app:startDestination="@id/homeFragment" ...>
    <fragment android:id="@+id/homeFragment" .../>
    <fragment android:id="@+id/productListFragment" .../>
    <fragment android:id="@+id/productFragment" .../>
    <fragment android:id="@+id/bargainFragment" .../>


    <navigation
    	android:id="@+id/checkout_graph"
    	app:startDestination="@id/cartFragment">

        <fragment android:id="@+id/orderSummaryFragment".../>
        <fragment android:id="@+id/addressFragment" .../>
        <fragment android:id="@+id/paymentFragment" .../>
        <fragment android:id="@+id/cartFragment" .../>

    </navigation>


</navigation>
```

여기까지 모두 했다면 `by navGraphViewModels`를 이용해서 ViewModel을 가져옵니다.

```kotlin
val viewModel: CheckoutViewModel by navGraphViewModels(R.id.checkout_graph)
```


이는 java 프로그래밍에서도 적용되는데요, 이렇게 사용하면 된다고 합니다.

```kotlin
public void onCreate(@Nullable Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);


    // Other fragment setup code

    NavController navController = NavHostFragment.findNavController(this);

    ViewModelProvider viewModelProvider = new ViewModelProvider(this,
        navController.getViewModelStore(R.id.checkout_graph));

    CheckoutViewModel viewModel = viewModelProvider.get(CheckoutViewModel.class);

    // Use Checkout ViewModel
}
```


nested graph(로그인 흐름, 체크아웃 흐름 등)는 나머지 탐색 그래프로부터 캡슐화 됩니다. 중첩된 그래프를 탐색할 수 있지만 그래프 외부에서 중첩된 그래프 내의 특정 대상으로 직접 이동할 수는 없다고 합니다.
따라서 체크아웃 흐름이나 로그인 흐름과 같이 화면들을 캡슐화하는 것입니다.

### 느낀점

jetpack navigation은 docs에 많은 부분을 차지하고 있기 때문에 공부해보면 좋다고 생각이 들었습니다.그리고 single activity에 잘 어울릴 것이라 생각이 들었습니다. Activity와 Fragment 구성이 복잡하게 얽혀있으면 코드가 복잡해질 텐데 저렇게 화면을 잇는 새로운 navigation resource가 생겨서 편리하게 사용할 수 있을 것 같습니다.

제 개인 프로젝트에 잘 사용할 수 있었으면 좋겠네요:>

### Reference

[ViewModels with Saved State, Jetpack Navigation, Data Binding and Coroutines](https://medium.com/androiddevelopers/viewmodels-with-saved-state-jetpack-navigation-data-binding-and-coroutines-df476b78144e)

[Android Jetpack Navigation Component](https://namjackson.tistory.com/28)
