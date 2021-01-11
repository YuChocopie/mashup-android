---
title: "View Binding in Fragment"
date: "2021-01-09"
tags:
  ["mash-up", "seungyoon", "View Binding", "Fragment"]
description: "Fragment에서 View Binding을 올바르게 사용해봅시다."
cover: "ViewBinding/viewbinding_cover.png"
---

<br>
<img src="ViewBinding/1*g-J92x35cABd-B3dC3ttZQ.png" width="500">
</br>

[**이전 글**](https://mashup-android.vercel.app/seungyoon/viewbinding/)에서 **View Binding**이 무엇인지와 Activity, Fragment에서의 사용법을 알아봤습니다.<br></br>
하지만, **Fragment**에서 **View Binding**을 사용시 발생하는 이슈가 있어 해당 이슈를 알아보는 글을 포스팅 하려고 합니다.
<br></br>

## **Problems in ViewBinding**

> **View Binding in Fragment**

```kotlin
 private var _binding: ResultProfileBinding? = null
    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = ResultProfileBinding.inflate(inflater, container, false)
        val view = binding.root
        return view
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
    
```

안드로이드 공식 문서에서 **Fragment**에서 **View Binding**의 사용법을 위와 같은 [**샘플 코드**](https://developer.android.com/topic/libraries/view-binding?hl=ko)로 제시하고 있습니다.

위처럼 코드를 작성하는 이유는 **Fragment**에서 **View Binding**을 사용할 경우 **Fragment**는 **View**보다 **오래 지속**되어,

**Fragment**의 **Lifecycle**로 인해 **메모리 누수**가 발생할 수 있기 때문입니다. 

예를들어 **Fragment**에서 **Navigation component** 또는 **BackStack** or **detach**를 사용하는 경우, **onDestroyView()** 이후에 **Fragment view**는 종료되지만, **Fragment**는 여전히 살아 있습니다. 즉 **메모리 누수**가 발생하게 됩니다.

▶ 그래서 반드시 binding 변수를 **onDetsroyView()** 이후에 **null**로 만들어 줘야합니다.

<br>
<img src="ViewBinding/R1280x0.png">
</br>

> Fragments outlives their views?


구글은 **Fragment**의 재사용을 위해 **View**들을 메모리에 보관하도록 **Fragment**의 동작을 변경하였습니다.

그래서 onDestroy() - onDestroyView()가 호출되고 나서도 **View Binding**에 대한 참조를 가비지 컬렉터에서 가비지 컬렉션을 명확하게 해 줄 필요가 있습니다.
#


#### **하지만**, 이러한 코드는 의문점들이 있습니다.

-   왜 2개의 binding 변수들을 필요로 하는 걸까요?
-   모든 Fragment에 각각 binding 변수들을 **nullify** 해줘야 할까요? 

우리는 이러한 코드들을 Fragment의 특성 때문에 매번 추가해주는 것은 원치 않을 것입니다.

<br>
<img src="ViewBinding/view_binding_kotlin.png" width="200">
</br>

## "어떻게 해당 이슈를 **향상**시킬 수 있을까요?"

**여기에는 몇 가지 해결책들이 존재합니다.**
<br></br>

#### **1**. View Binding을 사용하지 않고 **findViewById**를 사용하기.

```kotlin
private lateinit var textView: TextView

fun onViewCreated (view: View, savedInstanceState: Bundle) {
	val binding = ResultProfileBinding.bind(view)
	textView = binding.textView
}
```
▶ 이 방식은 **Type Safe**하지 않고, 성능도 손해를 보는 부분이 있습니다. 하지만 View Binding의 이슈에는 자유로울 수 있습니다.
#

#### **2**. onCreateView() 또는 onViewCreated()에서 View Binding 참조 끝내기.

```kotlin
Class ProfileFragment : Fragment(R.layout.profile_layout) {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val binding = ProfileLayoutBinding.bind(view)
        binding.textName.text = "ch8n"
    }
}
```

▶ 위의 코드처럼 **레이아웃이 이미 확장**되어 있다면 **inflate()** 대신에 View Binding의 정적**bind()** 메소드를 호출하면 됩니다.

> bind()

<br>
<img src="ViewBinding/bind.png" width="500">
</br>

**bind()** 메소드의 **내부**는 위와 같습니다.

해당 binding의 생성된 View 필드를 초기화하기 위해 전달한 View에서 내부적으로 **findViewById**를 사용합니다.

**※ 주의할 점은 bind() 함수를 여러 번 호출하지 않아야 합니다.**

→ bind() 함수가 호출될 때마다 모든 binding field를 다시 초기화하는 findViewById가 Trigger 될 수 있습니다.
#
#### **3**. binding 변수에 **property delegation** 사용하기.

```kotlin
class AutoClearedValue<T : Any>(val fragment: Fragment) : ReadWriteProperty<Fragment, T> {
    private var _value: T? = null

    init {
        fragment.lifecycle.addObserver(object: DefaultLifecycleObserver {
            override fun onCreate(owner: LifecycleOwner) {
                fragment.viewLifecycleOwnerLiveData.observe(fragment) { viewLifecycleOwner ->
                    viewLifecycleOwner?.lifecycle?.addObserver(object: DefaultLifecycleObserver {
                        override fun onDestroy(owner: LifecycleOwner) {
                            _value = null
                        }
                    })
                }
            }
        })
    }

    override fun getValue(thisRef: Fragment, property: KProperty<*>): T {
        return _value ?: throw IllegalStateException(
            "should never call auto-cleared-value get when it might not be available"
        )
    }

    override fun setValue(thisRef: Fragment, property: KProperty<*>, value: T) {
        _value = value
    }
}

/**
 * Creates an [AutoClearedValue] associated with this fragment.
 */
fun <T : Any> Fragment.autoCleared() = AutoClearedValue<T>(this)
```

▶ 위의 코드는 구글의 아키텍처 샘플 코드인 **[AutoCleardValue](https://github.com/android/architecture-components-samples/blob/master/GithubBrowserSample/app/src/main/java/com/android/example/github/util/AutoClearedValue.kt)입니다.**

> **해당 코드를 사용하기 위해선 build.gradle(app)에 dependencies를 추가해줘야 합니다.**

```kotlin
implementation "androidx.lifecycle:lifecycle-runtime:2.2.0"
implementation "androidx.lifecycle:lifecycle-common-java8:2.2.0"
implementation "androidx.lifecycle:lifecycle-viewmodel-ktx:2.2.0"
implementation "androidx.lifecycle:lifecycle-livedata-ktx:2.2.0"
```

> **Usage**

▶ AutoCleardValue의 사용법은 다음과 같습니다.

```kotlin
// View binding
private var binding by autoCleared<FragmentUserProfileBinding>()

override fun onCreateView(
      inflater: LayoutInflater, container: ViewGroup?,
      savedInstanceState: Bundle?
): View? {
      binding = FragmentUserProfileBinding.inflate(inflater, container, false)
      return binding.root
}

// Using with binding
override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    binding.txtMain.text = "Hello World!"
 }
```

-   binding 변수에 **by** 키워드로 위임하게 되면 더 이상 Fragment에서 2개의 binding 변수들이 필요 없습니다.
-   그리고 destroyed 될 때에도 **clear** 시켜줄 필요가 없습니다.

**하지만, 위와 같은 코드는 작성하기 쉽지 않습니다.**

**또한 Fragment의 코드 몇 줄을 줄이기 위해 [delegate patern](https://codechacha.com/ko/kotlin-deligation-using-by/)을 적용한 N 줄을 추가하는 것이 큰 이점이 있는 것인가에 대한 의견들도 있습니다.**

**그래서 몇몇 개발자들은 View Binding을 편하게 사용하기 위해 본인의 library를 만들어 코드에 적용하고 있는 모습들도 확인할 수 있습니다.**

-   [ViewBindingDelegate](https://github.com/hoc081098/ViewBindingDelegate)
-   [Binding](https://github.com/hi-dhl/Binding)
-   [ViewBinding-ktx](https://github.com/wada811/ViewBinding-ktx)
#
#### 4. **Skeletal-Class** 만들어 사용하기

**▶ BaseActivity, BaseFragment** 클래스를 만들어 반복되는 코드들을 줄여줄 수 있습니다.
#

## **결론**

-   View Binding을 Fragment에서 사용하는 것에 대해 아직까지 명확한 해답이 존재하지 않는 것 같습니다.
-   구글에서 해당 이슈에 대한 명확한 해답을 제시하기 전까진 위의 해결책들을 사용하는 것이 가장 좋은 방법인 것 같습니다.

---

## **References**

[**Simple one-liner ViewBinding in Fragments and Activities with Kotlin**](https://medium.com/@Zhuinden/simple-one-liner-viewbinding-in-fragments-and-activities-with-kotlin-961430c6c07c)

[**View Binding in Fragments**](https://medium.com/@sriramaripirala/view-binding-in-fragments-795307fb5a53)

[**View Binding을 Fragment에서 사용 시 Memory leak 방지하기**](https://www.androidpub.com/3005236)

[**Yet Another View Binding Article?**](https://chetangupta.net/viewbinding/)