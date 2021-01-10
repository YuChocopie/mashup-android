---
title: RecyclerView
date: "2020-12-25"
tags: ["start", "mash-up", "seohui", "recyclerview", "androidweekly"]
description: "RecyclerView 기본 설명 및 관련 위클리 번역."
cover: "./cover.png"
---

# RecyclerView

## 개요

> `RecyclerView` 위젯은 `ListView`가 더 진보하고 유연해진 버전입니다.
>
> `RecyclerView` 모델에서는 여러 다양한 구성요소가 함께 작동하여 데이터를 표시합니다. 사용자 인터페이스의 전체 컨테이너는 레이아웃에 추가하는 `RecyclerView` 객체입니다. `RecyclerView`는 개발자가 제공한 *레이아웃 관리자*에서 제공한 뷰로 채워집니다. 표준 레이아웃 관리자(예: `LinearLayoutManager` 또는 `GridLayoutManager`) 중의 하나를 사용하거나 직접 구현할 수 있습니다.

> 목록의 뷰는 _뷰 홀더_ 객체로 표현됩니다. 이러한 객체는 `RecyclerView.ViewHolder`를 확장하여 정의한 클래스의 인스턴스입니다. 각 뷰 홀더는 뷰를 사용하여 단일 항목을 표시하는 역할을 합니다. 예를 들어, 목록에서 음악 컬렉션을 표시한다면 각 뷰 홀더는 단일 앨범을 표현할 수도 있습니다. `RecyclerView`는 동적 콘텐츠에서 화면에 나타나는 부분을 표시하는 데 필요한 뷰 홀더와 몇 개의 추가 뷰 홀더만큼만 만들면 됩니다. 사용자가 목록을 스크롤하면 `RecyclerView`는 화면에 나타나지 않는 뷰를 가져와서 화면에 스크롤되는 데이터와 다시 바인딩합니다.
>
> 뷰 홀더 객체는 `RecyclerView.Adapter`를 확장하여 만든 *어댑터*에서 관리합니다. 어댑터는 필요에 따라 뷰 홀더를 만듭니다. 또한 어댑터는 뷰 홀더를 데이터에 바인딩합니다. 이 작업은 뷰 홀더를 특정 위치에 할당하고 어댑터의 `onBindViewHolder()` 메서드를 호출하여 실행됩니다. 이 메서드는 뷰 홀더의 위치를 사용하여 목록 위치를 기반으로 콘텐츠를 결정합니다.

<p align = "center"><img src="./RecyclerView/recyclerview.jpg" alt="recyclerview" style="zoom:80%;" /></p>

[^recyclerview image]: https://wooooooak.github.io/android/2019/03/28/recycler_view/

> 이 `RecyclerView` 모델은 많은 최적화 작업을 하므로 다음을 실행할 필요가 없습니다.
>
> - 목록이 처음 게재되면 목록의 측면에 뷰 홀더를 만들고 바인딩합니다. 예를 들어, 뷰가 목록 위치를 0에서 9로 표시하면 `RecyclerView`는 목록 위치의 뷰 홀더를 만들고 바인딩하며 위치 10의 뷰 홀더를 만들고 바인딩할 수도 있습니다. 이러한 방식으로, 사용자가 목록을 스크롤할 경우 다음 요소가 표시될 준비가 됩니다.
> - 사용자가 목록을 스크롤하면 `RecyclerView`는 필요에 따라 새 뷰 홀더를 만듭니다. 또한 화면 밖으로 스크롤된 뷰 홀더를 재사용할 수 있도록 저장합니다. 사용자가 스크롤 방향을 바꾸면 화면 밖으로 스크롤됐던 뷰 홀더는 곧바로 되돌아올 수 있습니다. 반면, 사용자가 같은 방향으로 스크롤을 계속하면 가장 오래전에 화면 밖으로 스크롤된 뷰 홀더는 새 데이터로 다시 바인딩될 수 있습니다. 뷰 홀더를 만들거나 뷰 홀더의 뷰를 확장할 필요는 없습니다. 대신 앱은 바인딩된 새 항목과 일치하도록 뷰 콘텐츠를 업데이트하기만 하면 됩니다.
> - 표시된 항목이 변경되면 적절한 `RecyclerView.Adapter.notify…()` 메서드를 호출하여 어댑터에 알려줄 수 있습니다. 그런 다음 어댑터의 내장 코드는 영향을 받은 항목만 다시 바인딩합니다.

- ### Jetpack Compose

  Jetpack Compose는 네이티브 Android UI를 빌드하기 위한 최신 도구 키트입니다. Jetpack Compose는 적은 수의 코드, 강력한 도구 및 직관적인 Kotlin API로 Android에서의 UI 개발을 간소화하고 가속화합니다.

  개발자가 XML 레이아웃을 수정하거나 UI 위젯을 직접 만들지 않습니다. 대신 Jetpack Compose 함수를 호출하여 원하는 요소를 말하면 Compose 컴파일러에서 나머지 작업을 완료합니다.

  Jetpack Compose는 구성 가능한 함수를 중심으로 빌드되었습니다. 이러한 함수를 사용하면 UI의 구성 과정에 집중하기보다는 모양 및 데이터 종속성을 기술하여 앱의 UI를 프로그래매틱 방식으로 정의할 수 있습니다. 구성 가능한 함수를 만들려면 함수 이름에 `@Composable` 주석을 추가합니다.

  ***

  > Jetpack Compose는 기존과는 전혀 다른 방식으로 UI가 개발됩니다.
  > 개발자가 xml 레이아웃을 수정하거나 UI 위젯을 직접 만들지 않습니다. 대신 Jetpack Compose 함수를 호출하여 원하는 요소를 말하면 Compose 컴파일러에서 나머지 작업을 완료합니다.
  > 소스영역에 UI영역을 코딩하고 거기에 이벤트를 함께 처리하는 방식처럼 보입니다

- <img src="./RecyclerView/compose.jpg" alt="compose" style="zoom:50%;" />

[^compose image]: https://blog.karumi.com/android-jetpack-compose-review/

---

# How to make a RecyclerView in Jetpack Compose

## Jetpack Compose에서 RecyclerView 를 사용하는 방법

[![Ian Alexander](https://miro.medium.com/fit/c/96/96/2*rzfYoxAWI6Nn1gVOgSW7Hg.jpeg)](https://ian-alexander.medium.com/?source=post_page-----bf4751abee80--------------------------------)

[Ian Alexander](https://ian-alexander.medium.com/?source=post_page-----bf4751abee80--------------------------------)

> ---
>
> _alpha08 기준으로 작성되었습니다. Compose는 빠르게 발전하고 있으므로 일부 구문이 변경되었을 수 있습니다._
>
> **안드로이드를 개발해 봤다면 분명 본 적이 있을 것입니다. 이전에 `ListView` 에 비해 `RecyclerView`는 크게 개선되었지만 여전히 재미와는 거리가 멉니다. `RecyclerView`를 만드는 것은 복잡한 상용구 더미(pile of boilerplate) -- 화면 간 재사용이 어려운- - 와 헤더, item 콜백 및 다양한 item 유형과 같은 기본 작업의 복잡성을 포함합니다.**
>
> \*_Jetpack Compose는 어떻게 목록을 더 간단하게 만들까요?_

---

[^boilerplate]: 최소한의 변경으로 재사용할 수 있는 것 / 적은 수정만으로 여러 곳에 활용 가능한 코드, 문구 / 각종 문서에서 반복적으로 인용되는 문서의 한 부분 / 반복 코드

> ## Compose에서 목록 만들기
>
> **compose에서 목록을 만드는 것은 무척 쉽습니다. adapters가 없습니다. 또한 view holders가 없습니다.**

```kotlin
// list item 타입을 보여주는 데이터 객체
data class ItemViewState(
        val text: String
)

@Composable
fun MyComposeList(
        modifier: Modifier = Modifier,
        itemViewStates: List<ItemViewState>
) {
    // 수평 목록을 만들 때 Lasy RowFor 사용
    LazyColumnFor(modifier = modifier, items = itemViewStates) { viewState ->
        MyListItem(itemViewState = viewState)
    }
}
// 각 list item의 UI는 재사용 가능한 composable에 의해 생성될 수 있습니다.
@Composable
fun MyListItem(itemViewState: ItemViewState) {
    Text(text = itemViewState.text)
}
```

> **필요한 것은 list item을 작성하기 위해 정의 된 데이터 구조와 Composable뿐입니다. 그게 다입니다. 농담이 아닙니다. :)**

![게시물 이미지](https://miro.medium.com/max/60/1*RVyjRR6MvXObpqxvxdC-Sw.jpeg?q=20)

## Item click callbacks

> **kotlin lambda를 사용하면 list item에 이벤트를 추가하는 것도 정말 간단합니다.**

```kotlin
@Composable
fun MyComposeList(
        modifier: Modifier = Modifier,
        itemViewStates: List<ItemViewState>,
        itemClickedCallback: () -> Unit,
) {
    LazyColumnFor(modifier = modifier, items = itemViewStates) { viewState ->
        MySimpleListItem(
            itemViewState = viewState,
            itemClickedCallback = itemClickedCallback
        )
    }
}

@Composable
fun MySimpleListItem(
    itemViewState: ItemViewState,
    itemClickedCallback: () -> Unit,
) {
    Button(onClick = { itemClickedCallback() }) {
        Text(text = itemViewState.text)
    }
}
```

## Multiple item types

> **<u>Jetpack Compose</u>는 데이터 기반이므로 여러 항목 유형을 갖기 위해 데이터 구조를 구축하는 것부터 시작합니다. 이는 compose에서 일반적으로 사용됩니다.**

```kotlin
sealed class ItemViewState
data class ItemTypeOne(val text: String) : ItemViewState()
data class ItemTypeTwo(
    val text: String,
    val description: String,
) : ItemViewState()
```

> 그리고 목록을 만들 때 when 문을 사용하여 데이터 항목에 따라 구성 할 수있는 항목을 선택합니다.

```kotlin
@Composable
fun MyMultipleItemList(
    modifier: Modifier = Modifier,
    itemViewStates: List<ItemViewState>,
) {
    LazyColumnFor(modifier = modifier, items = itemViewStates) { viewState ->
        when (viewState) {
            is ItemTypeOne -> ItemOne(viewState)
            is ItemTypeTwo -> ItemTwo(viewState)
        }
    }
}
@Composable
fun ItemOne(itemTypeOne: ItemTypeOne) {
    Text(text = itemTypeOne.text)
}

@Composable
fun ItemTwo(itemTypeTwo: ItemTypeTwo) {
    Column {
        Text(text = itemTypeTwo.text)
        Text(text = itemTypeTwo.description)
    }
}
```

> compose를 사용하면 UI를 연결하는데 들이는 시간을 줄이고 견고한 데이터 구조로 뒷받침되는 매력적인 UI 구성 요소를 구축하는 데 더 많은 시간을 할애 할 수 있습니다.

## Abstracting logic

> 위의 코드 샘플에서 눈치 채 셨을 수 있는 것은 뷰가 큰 역할을 하지 못한다는 것입니다.

> ---
>
> **Compose**는 기본적으로 `view layer`를 무력하게 만듭니다. 오래된 안드로이드 버전에서는 `view layer`에서 logic을 꺼내 프레젠테이션 레이어 (Presenter, ViewModels 등)로 가져와 사용해야 했습니다. **Jetpack Compose**에서 로직을 `view layer`에 넣는 작업을 해야 합니다. 좋은 아키텍처 사용은 compose에서 가장 적은 오류를 내는 하나의 방법이 될 수 있습니다.
>
> **Compose**에서는 logic은 데이터 구조에 있으며 데이터 구조를 조작하여 UI에 표시하는 방법에 있습니다. --`view`는 데이터 구조의 변경에 반응하는 재사용 가능한 `Components`로 구성됩니다. 이를 통해 로직을 앱 아키텍처의 상위 수준으로 쉽게 이동할 수 있을뿐만 아니라 적극적으로 권장합니다.
>
> 목록의 경우, 우리의 작업을 정말 간단하게 만듭니다. 그러나 이것이 실제로 어떻게 작동할까요? 다음 포스트에서는 실제 사례를 가져와 살펴 보겠습니다!
>
> 행복한 **compose** 사용이 되기를!
>
> 전체 코드 샘플을 볼 수 있는 repo* [*here\*](https://github.com/enyciaa/ComposeListPlayground)

```
#### reference

---

https://developer.android.com/guide/topics/ui/layout/recyclerview?hl=ko
https://developer.android.com/jetpack/compose/tutorial?hl=ko

https://bacassf.tistory.com/92 (Jetpack compose)
https://blog.karumi.com/android-jetpack-compose-review/
https://wooooooak.github.io/android/2019/03/28/recycler_view/

RecyclerView의 기본 기능 및 구조를 살펴보고 JetPack Compose에서 RecyclerView가 사용되는 것을 설명한 위클리 문서를 번역해 보았습니다.

[원문] (https://proandroiddev.com/how-to-make-a-recyclerview-in-jetpack-compose-bf4751abee80)
*https://androidweekly.net/issues/issue-444의 12월 13일 #444호에 실린 내용입니다.




```
