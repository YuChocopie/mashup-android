---

title: "Airbnb Mavericks 살펴보기"

date: "2021-09-10"

tags: ["mash-up", "Airbnb", "Mavericks", "State Management"]

description: "에어비엔비의 상태관리 라이브러리인 메버릭스(Mavericks) 를 소개하는 시간을 가져볼까 합니다."

cover: "./images/thumbnail.png"

---

안드로이드 앱을 개발하다가 보면, 현재 화면에 필요한 데이터들을 어떻게 관리하는게 좋을까 하는 고민거리가 생깁니다. 데이터들은 이전화면에서 받아온 extra 일수도 있고, SQLite/Preference/Server api 등 각기 다른 DataSource에서 가지고 올 것입니다.

Activity / Fragment의 전역변수로 가지고 있거나, ViewModel의 LiveData<T> 형태 등등 다양한 형태로 저장을 하고 있습니다. 하지만, 특정 시점에 어떤 데이터를 가지고 있는지, 반대로 데이터만 보고 사용자가 어떤 행동을 해왔었는지를 추적하고 싶은 요구사항이 생겼을 경우에 손쉽게 해결할 수 있을까요? 혹은, 이벤트처리 / 데이터 처리를 좀 더 손쉽게 할 수 있는 방법이 있지 않을까요? 
  
해서 등장한 개념인 `상태관리(State Management)`와 이를 개발자가 쉽게 구현해서 사용할 수 있도록 만든 프레임워크인 `메버릭스(Mavericks)`를 소개해보는 시간을 가져볼까 합니다.

### [Mavericks (구 MvRx)](https://airbnb.io/mavericks/#/)
- Airbnb 오픈소스로 만든 **MVI 프레임워크**로 상태관리를 쉽게 처리 하기 위한 솔루션을 제공
- Mavericks 1.0은 **RxJava** 기반으로 되어 있었는데, 2.0에서 **Coroutines** 으로 새롭게 작성됨.

### Core Concept
Mavericks를 구성하는 핵심 개념 3가지 - `MavericksState`, `MavericksViewModel`, `MavericksView` - 에 대해서 알아보겠습니다. 이 3가지 개념들을 잘 조합하는것 만으로 견고한 Mavericks 프로젝트를 만들 수 있습니다.
  
#### MavericksState
State라고 표시해주는 interface으로, 상속 받은 클래스에서는 화면에 필요한 정보들을 가지고 있습니다. 다음과 같은 특징을 가집니다.
  - Thread Safe
  - 가지고 있는 정보를 바탕으로 UI를 그리게됨(render)
  - kotlin data class 
  - immutable properties
  - 초기 상태를 전달하기 위한 default value를 가지고 있음.
  
```kotlin
data class UserState(
  val name: String = "사용자",
  val age: Int = 27,
  val regionName: String = "역삼1동",
  val profileImageUrl: String? = null
) : MavericksState {
  
  // derived proerites
  val introduction: String
      get() = "이름: $name, 나이: $age, 사는곳: $regionName"
}
```
  
#### MavericksViewModel
MavericksViewModel은 화면회전 / LMK 등의 Configuration Changes가 발생할때, 데이터를 유지하기 위해서 `Jetpack ViewModel`을 구현하는 형태로 사용하고 있습니다.
- 상태(MavericksState) 업데이트
- stateFlow을 사용해서 stream으로 상태를 구독할 수 있는 메소드 제공 (1.0버전에서는 RxJava를 사용함.)
  
```kotlin
class UserViewModel(
    initialState: UserState,
    private val userRepository: UserRepository,
    private val regionRepository: RegionRepository
) : MavericksViewModel<UserState>(initialState) {
    

    companion object : MavericksViewModelFactory<UserViewModel, UserState> {

        override fun initialState(viewModelContext: ViewModelContext): MyState {
            return MyState(...)
        }

        override fun create(viewModelContext: ViewModelContext, state: MyState): MyViewModel {
            return MyViewModel(state, ...)
        }
    }
}
```

