---

title: "RecyelrView Anti Patterns"

date: "2021-02-21"

tags: ["recyclerview-anti-pattern", "recyclerview", "anti-pattern", "mash-up"]

description: "실수하기 쉬운 리싸이클러뷰 안티패턴에 대해 포스팅해보겟습니다."

cover: "./recyclerview_anti_patterns.png"

---

안녕하세요. 메시업 안드로이드 10기 이두한입니다.  
이번엔 Android Weekly에 올라온 [RecyclerView-AntiPatterns](https://proandroiddev.com/recyclerview-antipatterns-8af3feeeccc7) 내용을 번역하여 포스팅 해보겠습니다.  

---

## 1. Initializing in bindView
첫번째는 뷰를 완전히 재사용하지 않는 안티패턴입니다.  
`RecyclerView`에서 `텍스트뷰` 하나만을 보여주는 예제입니다. 

```kotlin
class RecyclerViewAdapter(
	private val onItemClick : (Data) -> Unit
) : RecyclerView.Adapter<RecyclerViewAdapter.MyViewHolder>() {

    //..Other overrides
    private val itemList: List<Data> = //...DO STUFFS 

    inner class MyViewHolder(val itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvText : TextView = itemView.findViewById(R.id.textView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.item, parent, false)
        return MyViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val itemAtPosition = itemList[position]
        holder.tvText.text = itemAtPosition.text
        holder.tvText.setOnClickListener {
            onItemClick(itemAtPosition)
        }
    }

}
```
문제점을 바로 찾으셨나요?? 문제점은 바로 `onBindViewHolder`안에서 `setOnClickLisenter`를 수행하고 있다는 점입니다. `View`가 재사용되고 bind 될때 마다 `clickListner`를 set 해주는 것은 아주 비효율적이고 성능에도 영향을 미칩니다.  
이를 해결하기 위해서는 `ViewHolder`를 초기화 해주는 곳이나 `onCreateViewHolder`에서 `setOnClickListener`를 수행하도록 수정하면 됩니다. 

```kotlin
inner class MyViewHolder(
    itemView: View,
    private val onTextViewTextClicked: (position: Int) -> Unit
) : RecyclerView.ViewHolder(itemView) {
    val tvText: TextView = itemView.findViewById(R.id.textView)
    init {
        tvText.setOnClickListener {
            onTextViewTextClicked(adapterPosition)
        }
    }
}
```

또한 `itemList[index]` 형태로 리스트의 아이템을 전달할때 `Adapter` 내부에서 아래와 같이 캡슐화 할 수 있습니다.

```kotlin
//onItemClick is a parameter in Adapter constructor
private val onTextViewTextClicked = { position: Int ->
    onItemClick.invoke(itemList[position])
}

override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
    val itemView = LayoutInflater.from(parent.context).inflate(R.layout.item, parent, false)
    return MyViewHolder(itemView, onTextViewTextClicked)
}
```

---
  
## 2. Having logic inside the adapter
2번째 안티패턴은 `Adapter`가 로직을 가지고 있는 겁니다. `Adapter`은 유저에게 `ViewHolder`들을 보여주는 역할만을 해야 합니다.

```kotlin
override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
    val itemView = LayoutInflater.from(parent.context).inflate(R.layout.item, parent, false)
    return MyViewHolder(
        itemView = itemView,
        onTextViewTextClicked = { position: Int ->
            val itemAtIndex = itemList[position]
            val intent = getDetailActivityIntent(itemAtIndex)
            parent.context.startActivity(intent)
        })
}
```

위의 코드를 보면 `onTextViewTextClicked`안에서 intent를 받아오고 Activity를 실행시키는데, 데이터를 전달하는 역할만을 해야합니다.

만약, 같은 UI를 재사용하지만 클릭시 다른 interaction이 필요하다면 아래와 같이 여러개의 `Callback`을 사용하는 방법이 있습니다.

```kotlin
class RecyclerViewAdapter(
    private val onAddClick: (itemAtIndex: Data) -> Unit,
    private val onRemoveClick: (itemAtIndex: Data) -> Unit,
    private val onItemClick: (itemAtIndex: Data) -> Unit
)

class RecyclerViewAdapter(
    private val onItemViewClick: (clickedViewId: Int, itemAtIndex: Data) -> Unit
) 
```

---

## 3. Changing the state of view inside the ViewHolder
3번째 안티패턴은 `ViewHolder`안에서 뷰의 상태를 직접적으로 바꾸는 것입니다. 예를 들어서 ViewHolder안에서  `CheckBox`상태를 바꾸는 예제를 보겠습니다.

```kotlin
override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
    //Note: checkbox clickable is set to false to control the logic ourselves
    holder.itemView.setOnClickListener {
        //Toggle
        holder.checkBox.isChecked = holder.checkBox.isChecked.not()
    }
}
```
이 작업을 수행하고 목록을 100개 항목으로 채운 다음 처음 2~3개 항목을 확인하고 아래로 스크롤하면 해당 위치를 클릭한 적이 없는 경우에도 다른 위치가 확인되는 것을 볼 수 있는데, 다시 한 번 뷰가 재활용되고 있기 때문입니다. 상태가 확인된 뷰가 재활용되면 그대로 유지 됩니다.  
이는 아래와 같이 data class에 `isChecked`변수를 `false`로 설정하여 해결할 수 있습니다.

```kotlin
data class Data(
	val text: String,
	val isChecked: Boolean = false
)
```

```kotlin
override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
    holder.checkBox.isChecked = itemList[position].isChecked
    holder.itemView.setOnClickListener {
        holder.checkBox.isChecked = holder.checkBox.isChecked.not()
    }
}
```
다시 테스트하고 데이터를 채우고 일부를 확인하고 아래로 스크롤 하면 괜찮아 보입니다. 하지만 위로 스크롤하면 모든 체크 상태가 사라지게 됩니다. 데이터 클래스 내부의 `isChecked`가 변경되지 않고 `false`로 유지되기 때문입니다.  
이를 해결하기 위해 `Adpater`를 다음과 같이 변경했습니다.

```kotlin
override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
    val itemAtPosition = itemList[position]
    holder.checkBox.isChecked = itemAtPosition.isChecked

    holder.itemView.setOnClickListener {
        itemList[position] = itemAtPosition.copy(
            isChecked = itemAtPosition.isChecked.not()
        )
    }
}
```

만약 유저가 리스트 안의 `checkbox`를 모두 선택하고 해제하는 기능을 넣는다고 가정하고 `Adapter`에 `selectAll`과 `UnSelectAll`이라는 두가지 기능을 더 추가해보겠습니다.

```kotlin
fun unselectAll() {
    itemList.map {  data->
        data.copy(isChecked = false)
    }
    notifyDataSetChanged()
}
fun selectAll() {
    itemList.map { data ->
        data.copy(isChecked = true)
    }
    notifyDataSetChanged()
}
```

그런 다음 상태가 다른 경우에만 `notifyDataSetChanged()`를 호출하도록 개선해보겠습니다.

```kotlin
fun unselectAll() {
    itemList.mapIndexed { position, data ->
        if (data.isChecked) {
            notifyItemChanged(position)
            data.copy(isChecked = false)
        }
    }
}
fun selectAll() {
    itemList.mapIndexed { position, data ->
        if (!data.isChecked) {
            notifyItemChanged(position)
            data.copy(isChecked = true)
        }
    }
}
```

지금 보면 `Adapter`안에서 너무 많은 일을 하고 있습니다. 나중에 항목을 제거하거나 숨기는 등의 기능이 추가된다면 `Adpater`는 점점 무거워집니다. `ViewHolder`를 보여주는 것 이외의 역할을 하고 있고 `bindView`은 로직도 갖고 있습니다. Adapter는 가능한 추상적으로 만들어야 합니다. Adapter를 추상화 하는 방법은 item이 변경될 때 마다 `Adapter`가 새로운 `itemList`를 받도록 아래와 같이 수정하는겁니다.

```kotlin
class RecyclerViewAdapter(
    val onCheckToggled: (position: Int, itemAtPosition: Data) -> Unit
) : RecyclerView.Adapter<RecyclerViewAdapter.MyViewHolder>() {

    //..Other overrides
    private var itemList: List<Data> = listOf<Data>()

    fun submitList(itemList: List<Data>) {
        val oldList = this.itemList

        val maxSize = Math.max(newList.size, oldList.size)
        for (index in 0..maxSize) {
            val newData = newList.getOrNull(index)
            val oldData = oldList.getOrNull(index)

            if (newData == null) {
              notifyItemRemoved(index)
              return
            }

            if (oldData == null) {
                notifyItemInserted(index)
                return
            }

            if (newData != oldData) {
                notifyItemChanged(index)
                return
            }
        }
    }

    inner class MyViewHolder(
        itemView: View,
        onItemClick: (position: Int) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {

        val checkBox: CheckBox = itemView.findViewById(R.id.checkBgox)

        init {
            checkBox.setOnClickListener {
                onItemClick(adapterPosition)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MyViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.item, parent, false)
        return MyViewHolder(
            itemView = itemView,
            onItemClick = { position ->
                val itemAtPosition = itemList[position]
                this.onCheckToggled(position, itemAtPosition)
            }
        )
    }

    override fun onBindViewHolder(holder: MyViewHolder, position: Int) {
        val itemAtPosition = itemList[position]
        holder.checkBox.isChecked = itemAtPosition.isChecked
    }
}
```

`submitList`안에서 간단하게 diffing을 구현하고 있습니다. 하지만 매우 비효율적인데요, item이 100개가 있으면 해당 로직은 메인스레드에서 100번 반복되게 됩니다. 이러한 문제를 해결하고 비교를 더 쉽게하기 위해 `ListAdpater`가 등장했습니다.

```kotlin
class RecyclerViewAdapter(
    val onCheckToggled: (position: Int, itemAtPosition: Data) -> Unit
) : ListAdapter<Data, RecyclerViewAdapter.MyViewHolder>(
     object: DiffUtil.ItemCallback<Data>() {

        override fun areItemsTheSame(oldItem: Data, newItem: Data): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Data, newItem: Data): Boolean {
            return oldItem == newItem
        }

    }
)
```

이제 diffing은 백그라운 스레드에서 수행되게 되고 `submitList`에 itemList를 제출하기만 하면 모든 로직이 효율적으로 처리됩니다.

ListAdpater에 대한 자세한 설명은 `유정`님의 [RecyclerView ListAdapter DiffUtill](https://mashup-android.vercel.app/yuchocopie/recyclerview/ListAdapter/)을 참고하시면 됩니다.

이상으로 RecyclerView-AntiPatterns에 관한 포스팅을 마무리하도록 하겠습니다.  
감사합니다.

---
### Reference
[https://proandroiddev.com/recyclerview-antipatterns-8af3feeeccc7](https://proandroiddev.com/recyclerview-antipatterns-8af3feeeccc7)