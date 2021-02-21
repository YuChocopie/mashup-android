---
title: "MotionLayout을 활용하여 간단한 Animation 만들기"
date: "2021-02-21"
tags: ["mash-up", "mash-up 10기", "hyeonseong", "MotionLayout"]
description: "MotionLayout에 대해 알아보고 적용해봅시다."
cover: "./ic_motionlayout.png"
---



최근 디자인 개편 중 자연스러운 애니메이션을 적용해야 하는 업무가 생겼습니다.

 `CollapsingToolbarLayout` 과 비슷하지만 6개의 뷰 위치/노출 처리가 필요한 상황이었습니다. 

2개 이상의 뷰를 제어하는 처리라 `CollapsingToolbarLayout`으로는 해결할 수 없어 MotionLayout을 활용해야 했습니다.

그래서 이번 포스팅은 MotionLayout을 알아보고 정말 간단한 Animation 만들기입니다 :)



----



## MotionLayout



MotionLayout은 Google I/O '18에 처음 도입되었으며 이후 많은 개선을 거치고 있습니다.

사실 MotionLayout은 완전히 새로운 기능으로 도입된 것은 아니고, 원래 ConstraintLayout에서 애니메이션 효과를 주기 위해 사용한 ConstraintSet과 TransitionManager를 좀 더 쉽게 사용할 수 있는 툴 개념으로 도입된 것이라고 합니다.

저는 ConstraintSet과 TransitionManager 또한 사용해본 적이 없어 찾아보니, ConstraintSet, TransitionManager 조합의 경우 간단한 애니메이션 효과의 경우에도 해당 액티비티 또는 프래그먼트 단에서 코드를 추가해줘야 하는 번거로움이 있었지만, MotionLayout의 경우 XML 코드 단에서 추가 및 수정이 가능해 변경의 범위를 최소화 할 수 있다고 합니다.

또한, MotionLayout은 ConstraintLayout의 하위 클래스로 사용자 제어 애니메이션을 매우 쉽고 유지, 관리할 수 있도록 하는 것을 목표로 한다고 합니다.

ConstraintLayout의 확장 기능으로 도입된 만큼 MotionLayout은 ConstraintLayout의 일부 요소들을 상속 받고 있습니다.



<img src="motionlayout_img/motionlayout1.png" width="1000">



위 그림을 보면, MotionLayout은 기본 요소로 MotionScene, ConstraintSet, Transition 속성을 포함하고 있는 것을 볼 수 있습니다.

실제 코드에서 MotionScene과 ConstraintSet은 ConstraintLayout 내부 객체들의 효과를 주는 것을 담당하고, Transition은 아래 속성(OnClick, OnSwipe)에서 볼 수 있듯 클릭과 스와이프 인터렉션에 대한 콜백을 줄 수 있는 것을 담당합니다. 

많은 메일 앱들이 MotionLayout을 활용한 Animation 효과를 구현한다고 합니다. 대표적으로 네이버 메일과 Gmail 앱이 개별 메시지 / 메일 항목에 대한 스와이프 동작을 제공하여 해당 항목과 관련된 상황별 작업을 제공한다고 합니다. 

Gmail 앱의 스와이프 모습입니다. 메시지를 보관할 때는 왼쪽으로, 메시지를 삭제할 때는 오른쪽으로 스와이프합니다.

<img src="motionlayout_img/motionlayout5.gif" width="300">



----



## MotionLayout을 활용하여 간단한 Animation 만들기



<img src="motionlayout_img/motionlayout2.gif" width="300">



MotionLayout을 사용하려면 우선 라이브러리를 추가해야합니다.

Build.gradle에 아래의 코드를 추가해 최신 ConstraintLayout Library를 불어옵니다.

```kotlin
dependencies {
    implementation "androidx.constraintlayout:constraintlayout:2.0.0"
}
```



다음으로 애니메이션 효과를 줄 View를 생성해줘야합니다.

원래는 ConstraintLayout으로 작성을 했었지만, 애니메이션 효과를 주기 위해 MotionLayout으로 변경했습니다.



**motion_layout.xml** 

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.motion.widget.MotionLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/motion_layout"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/grayscale_01"
    app:layoutDescription="@xml/motion_scene">

    <androidx.constraintlayout.widget.Guideline
        android:id="@+id/guide_start_20"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        app:layout_constraintGuide_begin="20dp" />

    <androidx.constraintlayout.widget.Guideline
        android:id="@+id/guide_end_20"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        app:layout_constraintGuide_end="20dp" />

    <ImageView
        android:id="@+id/iv_brand_img"
        android:layout_width="0dp"
        android:layout_height="300dp"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        tools:src="@drawable/tempandroid" />

    <ImageView
        android:id="@+id/iv_previous"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="8dp"
        android:layout_marginTop="30dp"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        app:srcCompat="@drawable/ic_place_search_back_btn_white" />

    <TextView
        android:id="@+id/tv_brand_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:fontFamily="@font/spoqa_han_sans_bold"
        android:text="MotionLayout"
        android:textColor="@color/grayscale_11"
        android:textSize="14sp"
        app:layout_constraintBottom_toBottomOf="@id/iv_previous"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="@id/iv_previous" />

    <TextView
        android:id="@+id/tv_brand_name"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:fontFamily="@font/spoqa_han_sans_bold"
        android:text="MotionLayout"
        android:textColor="@color/grayscale_01"
        android:textSize="44sp"
        android:includeFontPadding="false"
        app:layout_constraintVertical_chainStyle="packed"
        app:layout_constraintBottom_toTopOf="@id/tv_brand_type"
        app:layout_constraintEnd_toEndOf="@id/guide_end_20"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/iv_previous" />

    <TextView
        android:id="@+id/tv_brand_type"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:fontFamily="@font/spoqa_han_sans_regular"
        android:text="MotionLaout"
        android:textColor="@color/grayscale_01"
        android:textSize="14sp"
        app:layout_constraintBottom_toTopOf="@id/tv_brand_location"
        app:layout_constraintEnd_toEndOf="@id/guide_end_20"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/tv_brand_name" />

    <TextView
        android:id="@+id/tv_brand_location"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:fontFamily="@font/spoqa_han_sans_regular"
        android:text="MotionLayout을 활용한 CollapsibleToolbar"
        android:textColor="@color/grayscale_01"
        android:textSize="14sp"
        app:layout_constraintEnd_toEndOf="@id/guide_end_20"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/tv_brand_type"
        app:layout_constraintBottom_toBottomOf="@id/iv_brand_img"/>

    <View
        android:id="@+id/contour1"
        android:layout_width="0dp"
        android:layout_height="8dp"
        android:background="@color/grayscale_02"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/iv_brand_img" />

    <TextView
        android:id="@+id/tv_intro"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="32dp"
        android:fontFamily="@font/spoqa_han_sans_bold"
        android:text="😃MotionLayout을 활용해보세요!"
        android:textColor="@color/grayscale_11"
        android:textSize="14sp"
        app:layout_constraintEnd_toEndOf="@id/guide_end_20"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/contour1" />

    <View
        android:id="@+id/contour2"
        android:layout_width="0dp"
        android:layout_height="1dp"
        android:layout_marginTop="16dp"
        android:background="@color/grayscale_03"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/tv_intro" />

    <View
        android:id="@+id/contour3"
        android:layout_width="0dp"
        android:layout_height="12dp"
        android:layout_marginBottom="4dp"
        android:background="@color/primary_color_lighter_05"
        app:layout_constraintBottom_toBottomOf="@id/tv_ticket_title"
        app:layout_constraintEnd_toEndOf="@id/tv_ticket_title"
        app:layout_constraintStart_toStartOf="@id/tv_ticket_title" />

    <TextView
        android:id="@+id/tv_ticket_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="32dp"
        android:fontFamily="@font/spoqa_han_sans_bold"
        android:text="MotionLayout"
        android:textColor="@color/grayscale_11"
        android:textSize="21sp"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/contour2" />

    <TextView
        android:id="@+id/tv_ticket_intro"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:fontFamily="@font/spoqa_han_sans_regular"
        android:text="MotionLayout을 사용해보세요!"
        android:textColor="@color/grayscale_07"
        android:textSize="14sp"
        app:layout_constraintEnd_toEndOf="@id/guide_end_20"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/tv_ticket_title" />

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recyclerview"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:layout_marginTop="24dp"
        app:layoutManager="androidx.recyclerview.widget.GridLayoutManager"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="@id/guide_end_20"
        app:layout_constraintStart_toStartOf="@id/guide_start_20"
        app:layout_constraintTop_toBottomOf="@id/tv_ticket_intro"
        app:spanCount="2" />

</androidx.constraintlayout.motion.widget.MotionLayout>
```



또한, MotionLayout 속성에 `app:layoutDescription` 을 추가하여 Motion 효과를 명시한 xml 파일을 넣어줬습니다.



**motion_scene.xml**

```xml
<?xml version="1.0" encoding="utf-8"?>
<MotionScene xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:motion="http://schemas.android.com/apk/res-auto">

    <Transition
        motion:constraintSetEnd="@id/collapsed"
        motion:constraintSetStart="@id/expand">

        <ConstraintSet android:id="@+id/expand">

            <Constraint
                android:id="@id/iv_brand_img"
                android:layout_width="0dp"
                android:layout_height="300dp"
                android:alpha="1"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toTopOf="parent" />

            <Constraint
                android:id="@+id/iv_previous"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginStart="8dp"
                android:layout_marginTop="20dp"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toTopOf="parent">

                <CustomAttribute
                    motion:attributeName="ColorFilter"
                    motion:customColorValue="@color/grayscale_01" />

            </Constraint>

            <Constraint
                android:id="@id/tv_brand_title"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:alpha="0"
                app:layout_constraintBottom_toBottomOf="@id/iv_previous"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toTopOf="@id/iv_previous"/>

            <Constraint
                android:id="@id/tv_brand_name"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:alpha="1"
                app:layout_constraintVertical_chainStyle="packed"
                app:layout_constraintBottom_toTopOf="@id/tv_brand_type"
                app:layout_constraintEnd_toEndOf="@id/guide_end_20"
                app:layout_constraintStart_toStartOf="@id/guide_start_20"
                app:layout_constraintTop_toBottomOf="@id/iv_previous" />

            <Constraint
                android:id="@id/tv_brand_type"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:alpha="1"
                app:layout_constraintBottom_toTopOf="@id/tv_brand_location"
                app:layout_constraintEnd_toEndOf="@id/guide_end_20"
                app:layout_constraintStart_toStartOf="@id/guide_start_20"
                app:layout_constraintTop_toBottomOf="@id/tv_brand_name" />

            <Constraint
                android:id="@id/tv_brand_location"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="24dp"
                android:alpha="1"
                app:layout_constraintEnd_toEndOf="@id/guide_end_20"
                app:layout_constraintStart_toStartOf="@id/guide_start_20"
                app:layout_constraintTop_toBottomOf="@id/tv_brand_type"
                app:layout_constraintBottom_toBottomOf="@id/iv_brand_img" />

            <Constraint
                android:id="@id/contour1"
                android:layout_width="0dp"
                android:layout_height="8dp"
                android:alpha="1"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/iv_brand_img" />

        </ConstraintSet>

        <ConstraintSet android:id="@+id/collapsed">

            <Constraint
                android:id="@id/iv_brand_img"
                android:layout_width="0dp"
                android:layout_height="300dp"
                android:alpha="0"
                motion:layout_constraintBottom_toBottomOf="@id/iv_previous"
                motion:layout_constraintEnd_toEndOf="parent"
                motion:layout_constraintStart_toStartOf="parent" />

            <Constraint
                android:id="@+id/iv_previous"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginStart="8dp"
                android:layout_marginTop="20dp"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toTopOf="parent">

                <CustomAttribute
                    motion:attributeName="ColorFilter"
                    motion:customColorValue="@color/grayscale_07" />

            </Constraint>

            <Constraint
                android:id="@id/tv_brand_title"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:alpha="1"
                app:layout_constraintBottom_toBottomOf="@id/iv_previous"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toTopOf="@id/iv_previous"/>

            <Constraint
                android:id="@id/tv_brand_name"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:alpha="0"
                app:layout_constraintVertical_chainStyle="packed"
                app:layout_constraintBottom_toTopOf="@id/tv_brand_type"
                app:layout_constraintEnd_toEndOf="@id/guide_end_20"
                app:layout_constraintStart_toStartOf="@id/guide_start_20"
                app:layout_constraintTop_toBottomOf="@id/iv_previous"/>

            <Constraint
                android:id="@id/tv_brand_type"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="8dp"
                android:alpha="0"
                app:layout_constraintBottom_toTopOf="@id/tv_brand_location"
                app:layout_constraintEnd_toEndOf="@id/guide_end_20"
                app:layout_constraintStart_toStartOf="@id/guide_start_20"
                app:layout_constraintTop_toBottomOf="@id/tv_brand_name"/>

            <Constraint
                android:id="@id/tv_brand_location"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_marginTop="24dp"
                android:alpha="0"
                app:layout_constraintEnd_toEndOf="@id/guide_end_20"
                app:layout_constraintStart_toStartOf="@id/guide_start_20"
                app:layout_constraintTop_toBottomOf="@id/tv_brand_type"
                app:layout_constraintBottom_toBottomOf="@id/iv_brand_img" />

            <Constraint
                android:id="@id/contour1"
                android:layout_width="0dp"
                android:layout_height="8dp"
                android:alpha="0"
                app:layout_constraintEnd_toEndOf="parent"
                app:layout_constraintStart_toStartOf="parent"
                app:layout_constraintTop_toBottomOf="@id/iv_brand_img" />

        </ConstraintSet>

        <OnSwipe
            motion:dragDirection="dragUp"
            motion:onTouchUp="autoComplete"
            motion:touchAnchorId="@id/recyclerview"
            motion:touchAnchorSide="top" />

    </Transition>

</MotionScene>
```



Motion_scene.xml에는 해당 뷰의 상태와 그에 상응하는 전환과 애니메이션을 지정해야 합니다. 

Transition의 속성을 보면 `motion:constraintSetStart` 와 `motion:constraintSetEnd` 속성은 Animation 효과 동안 Constraint의 시작과 끝에 대한 정보를 나타냅니다. 

RecyclerView가 drag될 때 motion이 동작할 수 있도록 OnSwipe 속성에 지정해두었습니다.

이 예제에서는 정말 간단하게 alpha 값을 통해 Transition Effect를 구현하였지만, 다른 여러 요소들을 활용한다면 정말 다양한 애니메이션들을 구현할 수 있습니다 :)

감사합니다 😂
