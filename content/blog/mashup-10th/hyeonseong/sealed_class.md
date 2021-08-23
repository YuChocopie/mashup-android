---
title: Sealed class로 RecyclerView Multi View Type 때려 부수기
date: "2021-01-14"
tags: ["mash-up", "mash-up 10기", "hyeonseong", "sealed class"]
description: "Kotlin의 Sealed Class에 대해 알아보고, RecyclerView의 Multiple View Type 적용에 활용해보겠습니다."
cover: "./ic_sealed.png"
---

# Kotlin - Sealed Class



**안녕하세요 ! Mash-Up 10기 정현성 입니다.**

이번에는 [**Room**](https://mashup-android.vercel.app/hyeonseong/room/)에 이어 Kotlin의 Sealed Class에 대해 포스팅하려고 합니다 :)



## Sealed Class란?



`Sealed Class`는 상위 클래스를 상속받는 하위 클래스의 종류를 제한하는 특성이 있는 클래스입니다.

어떤 클래스를 상속받는 하위 클래스는 여러 파일에 존재할 수 있기 때문에 컴파일러는 얼마나 많은 하위 클래스들이 존재하는지 알지 못합니다.



하지만 `Sealed Class`는 동일 파일에 정의된 하위 클래스 외에는 존재하지 않는다는 것을 컴파일러에 알려줍니다.

예를 들어  `Color` 라는 상위 클래스를 만들고, 동일한 파일에 `Color Class` 를 상속하는 `Red Class`, `Black Class` 라는 클래스를 선언했다고 가정하면, 

`Sealed Class`는 두 개의 클래스 외에 `Color` 클래스를 상속받는 다른 클래스는 없다는 것을 컴파일러에 말해주는 것과 같다고 합니다.



이렇게  하위 클래스의 종류를 제한하여 얻을 수 있는 장점 중 하나는 `when` 을 사용할 때 `else` 를 사용하지 않는 것입니다.

```kotlin
val color = "Red"

val answer = when (color) {
    "Red" -> {
        "Red Color"
    }
    "Black" -> {
        "Black Color"
    }
    else -> {									// else를 사용해야 error를 방지할 수 있다.
        "None Color"
    }
}
```

```kotlin
sealed class Color {
    object Red: Color()
    object Black: Color()
}

val color : Color = Color.Red

val answer = when (color) {
    is Color.Red -> "Red Color"
    is Color.Black -> "Black Color"			// else를 사용하지 않아도 된다.
}
```

이것은 코틀린에서 제공하는 `Enum Class` 로도 얻을 수 있는 장점입니다. 



하지만 `Sealed Class` 와 `Enum Class` 의 차이점은 하위 객체를 생성할 수 있는 개수에 있습니다. `Enum Class` 는 하위 객체로 1개만 생성할 수 있지만, 

`Sealed Class` 는 1개 이상의 복수 객체를 생성할 수 있습니다. 예를 들어 `Sealed Class` 는 `Color Class` 를 상속하여 `Red Class`, `Black Class`, `Yellow Class` ... 

1개 이상의 복수 객체를 생성할 수 있지만, `Enum Class` 는 `Red Class` 하나만 생성할 수 있다는 것입니다. 



## Sealed Class 정의 방법



다음과 같이 `Sealed Class` 를 정의할 수 있습니다.

```kotlin
sealed class Color {
    object Red: Color()
    object Green: Color()
    object Blue: Color()
}
```

클래스 앞에 `sealed` 키워드를 붙이면 이 클래스는 `abstract` 클래스가 됩니다. 그리고 하위 클래스가 이 클래스를 상속하도록 하면 됩니다.

```kotlin
val color: Color = Color.Red
```

이런 식으로 객체를 생성할 수 있습니다.



## Sealed Class의 특징



* 클래스 이름 앞에 `sealed` 키워드를 붙여 정의한다.
* `Sealed Class` 는 추상 클래스로, 객체로 생성할 수 없다.
* `Sealed Class` 의 생성자는 `private` 이다.
* `Sealed Class` 와 그 하위 클래스는 동일한 파일에 정의되어야 한다.



***



## RecyclerView Multiple View Type에 Sealed Class 적용해보기!



### * Sealed Class 만들기



```kotlin
sealed class UIModel {
  	data class FeedyModel(
    		val title: String,
      	val description: String,
      	val businessName: String
    ): UIModel()
  
  	data class PromotionModel(
    		val title: String,
    		val description: String,
    		val image: String
    ): UIModel()
  
  	data class RatingCardModel(
    		val title: String,
    		val description: String,
    		val link: String,
    		val button_title: String
		): UIModel()
}
```

RecyclerView Adapter에서 사용하려는 모든 data class를 만들고 sealed class를 상속해줍니다.  이렇게 Sealed Class 구현을 마쳤습니다.



```kotlin
class FeedAdapter(context: Context) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {
  
  	private var arrayList: ArrayList<UIModel> = ArrayList()
  
  	fun submitData(list: ArrayList<UIModel>) {
      	arrayList.clear()
      	arrayList.addAll(list)
    }
  	
  	override fun getItemCount(): Int = arrayList.size
  
  	override fun getItemViewType(position: Int): Int {
      	return super.getItemViewType(position)
    }
  
 		override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }
  
}
```

이제  RecyclerView adapter를 구현해줄 차례입니다. 위 코드는 기본적인 RecyclerView adapter를 구현한 코드입니다. 



```kotlin

override fun getItemViewType(position: Int) = when (arrayList[position]) {
    is UIModel.FeedyModel -> R.layout.adapter_feed
    is UIModel.PromotionModel -> R.layout.adapter_promotion
    is UIModel.RatingCardModel -> R.layout.adapter_rating
}
```

getItemViewType()으로 position에 따라 적절한 View Type을 반환해주는 코드를 작성합니다.



```kotlin

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
    val layoutInflater = LayoutInflater.from(parent.context)
    val v = layoutInflater.inflate(viewType, parent, false)
  
    return when (viewType) {
        R.layout.adapter_feed -> FeedViewHolder(v)
        R.layout.adapter_promotion -> PromotionalCardViweHolder(v)
        else -> RatingCardViweHolder(v)
    }
}
```

이제 onCreateViewHolder에 viewType에 따라 각각의 ViewHolder를 생성해줍니다.



```kotlin

override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
    val item = arrayList[position]
    
  	when (holder) {
        is FeedViewHolder -> holder.onBindView(item as UIModel.FeedyModel)
        is PromotionalCardViweHolder -> holder.onBindView(item as UIModel.PromotionModel
        is RatingCardViweHolder -> holder.onBindView(item as UIModel.RatingCardModel)
    }
}
```

마지막으로 adapter가 UI에 data를 반영할 수 있도록 현재의 아이템 데이터와 함께 view holder를 업데이트해주는 것입니다.



```kotlin
class FeedAdapter(context: Context) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private var arrayList : ArrayList<UIModel> = ArrayList()

    fun submitData(list : ArrayList<UIModel>){
        arrayList.clear()
        arrayList.addAll(list)
    }

    override fun getItemCount(): Int = arrayList.size

    override fun getItemViewType(position: Int) = when (arrayList[position]) {
        is UIModel.FeedyModel -> R.layout.adapter_feed
        is UIModel.PromotionModel -> R.layout.adapter_promotion
        is UIModel.RatingCardModel -> R.layout.adapter_rating
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
    		val v = layoutInflater.inflate(viewType, parent, false)
  
    		return when (viewType) {
        		R.layout.adapter_feed -> FeedViewHolder(v)
        		R.layout.adapter_promotion -> PromotionalCardViweHolder(v)
        		else -> RatingCardViweHolder(v)
    		}
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
				val item = arrayList[position]
    
  			when (holder) {
        		is FeedViewHolder -> holder.onBindView(item as UIModel.FeedyModel)
        		is PromotionalCardViweHolder -> holder.onBindView(item as UIModel.PromotionModel
        		is RatingCardViweHolder -> holder.onBindView(item as UIModel.RatingCardModel)
    		}
    }

}
```

최종적으로 작성된 RecyclerView adapter 코드입니다.



***



RecyclerView Multiple View Type 구현에 Sealed Class를 활용하면, 코드가 좀 더 유연해지고 확장성이 높아진다고 합니다. 

이번 한 달 프로젝트에 적용해보겠습니다 :)