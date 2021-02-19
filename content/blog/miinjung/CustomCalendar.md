---
title: Custom Calendar
date: "2021-01-08"
tags: ["Custom Calendar", "mash-up", "miinjung","Android"]
description: "Android CustomCalendar 만들어봅시다"
cover: "./customCalendar.png"
---



# CustomCalendar 생성하기

 

Android 내부에도 Calendar View가 존재합니다



> [java.lang.Object](https://developer.android.com/reference/java/lang/Object)
>
> ↳	[android.view.View](https://developer.android.com/reference/android/view/View)  
>
> ​		↳	[android.view.ViewGroup](https://developer.android.com/reference/android/view/ViewGroup)
>
> ​				↳	[android.widget.FrameLayout](https://developer.android.com/reference/android/widget/FrameLayout)
>
> ​						↳	android.widget.CalendarView



하지만 커스텀할 수 있는 범위도 너무 한정적이고, 예쁜 디자인에 맞는 캘린더를 개발하기 위해서는 직접 달력을 커스텀하여 개발하는 과정이 필요합니다.

필자는 캘린더를 커스텀하기 위해서 __RecyclerView + GridLayoutManager__를 사용했습니다.

<br/>

캘린더의 생성만을 확인하기 위해 databinding, LiveData, architecture등의 사용을 제외했고, 추가적인 기능 또한 포함하지 않았습니다

ItemClickListener를 사용하기 위해서는 기존의 RecyclerView를 사용하듯 추가해주시면 됩니다.

<br/>

### 1. xml에 RecyclerView를 추가한다.

캘린터를 생성할 RecyclerView를 만듭니다.

```xml
<androidx.recyclerview.widget.RecyclerView
    android:id="@+id/listDiaryCalendarRV"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginStart="16dp"
    android:layout_marginEnd="16dp"
    android:layout_gravity="center"/>
```

<br/>

### 2. RecyclerView에 들어갈 item view를 생성합니다

캘린더에 들어갈 아이템을 생성합니다. 

필자는 가장 기본적인 달력을 생성하기 위해 TextView만 포함된 itemView를 생성했습니다.

날짜별 추가적인 요소들이 필요하다면 추가하여 사용하면 됩니다.

```xml
<LinearLayout
    android:id="@+id/diaryListCalendarBox"
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">
        <TextView
            android:id="@+id/diaryListCalendardayTV"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="@color/dark"
            android:textSize="14sp"/>
</LinearLayout>
```

<br/>

### 3. RecyclerView의 Adapter 생성하기

###### setData()

Activity로부터 두가지의 data를 전달 받게 될 것이다. 

- startPosition : 달력에서 시작 요일
- lastDay : 해당 월의 마지막 일

###### getItemCount()

입력되지 않는 공간 포함 item이 들어가야 할 size를 입력해야 하기 때문에 __lastDay + startPosition - 1__를 입력합니다.

> 요일은 일요일 : 1 , 토요일 : 7

<br/>

###### onBindViewHolder()

시작점 전까지 빈 공백으로 RecyclerView를 채워야 하기 때문에 현재 position과 StartPosition을 비교하여 textView를 채워주면 됩니다.

```kotlin
package com.mashup.telltostar.ui.diarylist

import ...

class DiaryListCalendarAdapter : RecyclerView.Adapter<DiaryListCalendarAdapter.DiaryListCalendarViewHolder>() {
    private var startPosition : Int = 0
    private var lastDay : Int = 0

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DiaryListCalendarViewHolder {
        val convertView = LayoutInflater.from(parent.context).inflate(R.layout.fragment_diary_list_calendar, parent, false)
        return DiaryListCalendarViewHolder(convertView)
    }

    override fun getItemCount() = lastDay + startPosition - 1

    override fun onBindViewHolder(holder: DiaryListCalendarViewHolder, position: Int) {
        if(position > startPosition-1){
            holder.calendarDay.text = (position-startPosition+1).toString()
        }else{
            holder.calendarDay.text = ""
        }
    }


    fun setData(startPosition : Int, lastDay : Int){
        this.startPosition = startPosition-1
        this.lastDay = lastDay
        notifyDataSetChanged()
    }
  
    class DiaryListCalendarViewHolder(view: View):RecyclerView.ViewHolder(view){
        val calendarDay = view.find(R.id.diaryListCalendardayTV) as TextView
    }

}
```

<br/>

### Activity에 RecyclerView initialize하기

###### initCalendar()

일반적인 RecyclerView의 adapter를 연결하듯이 연결하고,

LayoutManager는 GridLayoutManager를 선언하며 column은 7개이므로 column을 설정하는 두번째 parameter에 7을 추가합니다,

<br/>

###### setCalendarData()

Calendar class를 이용하여 현재의 날짜에서 '일'만 1로 변경합니다. (해당 월의 첫번째 요일을 얻기 위해)

해당 월의 1의 요일을 얻어 __startPosition__에 넣어주고,

해당 월의 마지막 날을 얻기 위해 __getActualMaximum__ 을 활용하여 현재 최대 일수를 확인하여 __lastDay__에 넣어줍니다.

Adapter의 setData를 활용하여 값을 넘겨줍니다.

```kotlin
private val diaryListCalendarAdapter = DiaryListCalendarAdapter()
private val current = Calendar.getInstance()

fun initCalendar(){
    listDiaryCalendarRV.adapter = this.diaryListCalendarAdapter
    listDiaryCalendarRV.setLayoutManager(GridLayoutManager(this, 7))
  	setCalendarData()
}

fun setCalendarData(){
  current.set(Calendar.DAY_OF_MONTH, 1)
  
  val startPosition = current.get(Calendar.DAY_OF_WEEK)
  val lastDay = current.getActualMaximum(Calendar.DAY_OF_MONTH)
  
  diaryListCalendarAdapter.setData(startPosition, lastDay)
}
```



## 정리

야 너두 이쁜 캘린더 만들 수 있어~
