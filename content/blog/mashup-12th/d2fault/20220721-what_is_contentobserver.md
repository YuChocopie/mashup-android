---
title: "ContentObserver 알아보기"
date: "2022-07-21"
tags: ["d2fault", "mash-up", "kotlin", "contentobserver", "contentprovider"]
description: "ContentObserver가 무엇인지 알아보고, 사용 방법을 익힙니다."
cover: "./ic_what_is_contentobserver.jpg"
---

# 개요

타 패키지의 DB 값을 `ContentProvider` 로 읽어오는 로직 개발 중 DB 값이 변경되었을 때의 이벤트를 수신하고 싶었다. 가장 쉽게 구현하는 방법으로는 DB 변경을 알려주는  `Intent` 규격을 하나 생성하는 것이겠지만, 구글링을 통해 내가 원하는 기능을 Android 플랫폼에서 자체적으로 제공한다는 사실을 알아냈다! (나만 몰랐던 이야기…?)

단, `ContentObserver`는 Oreo 이상에서만 동작한다. Oreo 미만 단말에서는 `Intent` 를 사용해야 하겠지요?

<br>

# `ContentObserver` 가 뭔데?

이름 그대로 ‘Content를 관찰’하다가 변경이 생겼을 때 알려주는 친구다. 즉, 우리는 변경을 관찰하고 싶은 `URI` 를 등록하기만 하면 된다. `BroadcastReceiver` 사용할 때와 동일하게 ‘등록’ 과정이 있기 때문에 모든 사용이 끝난 후에는 꼭! 메모리 누수 방지를 위한 **등록 해제가 필수이다.**

<br>

# 사용법

## `ContentObserver` 등록

`context` 로부터 `contentResolver` 에 접근할 수 있으며, 여기까지 접근하면 `registerContentObserver` 로 observer를 등록할 수 있다. 해제가 필수이기 때문에 등록한 `ContentObserver` 객체를 유지하고 있어야 한다.

```kotlin
// ContentObserver 생성하여 변수에 유지함
val contentObserver = object : ContentObserver(Handler()) {
    override fun onChange(selfChange: Boolean) {
        super.onChange(selfChange)
        if (selfChange) {
			// TODO: 이 이벤트 발생시의 동작 정의
        }
    }
}

// context에서 contentResolver에 접근하여 ContentObserver 등록
with(context.contentResolver) {
	/* notifyForDescendants: Boolean */
	//  true: 하위 경로의 변경도 관찰
	//  false: URI 경로의 변경만 관찰
	registerContentObserver(URI, true, contentObserver)
}
```



## `ContentObserver` 등록 해제

유지하고 있던 `contentObserver` 를 이용하여 등록을 해제한다.

```kotlin
context.contentResolver.run {
    unregisterContentObserver(contentObserver)
}
```

<br>

# 유의 사항

사실 위 과정은 변경하는 쪽에서 알려주지 않으면 말짱 도루묵이다. **DB를 수정하는 부분에서 아래 코드를 꼭! 추가해 주어야 한다.** (직접 해 봤는데 얘 없인 진짜 안 된다.)

```kotlin
context.contentResolver.apply { notifyChange(uri, null) }
```

<br>

# 참고

- [Android 공식 Document: registContentResolver](https://developer.android.com/reference/android/content/ContentResolver#registerContentObserver(android.net.Uri, boolean, android.database.ContentObserver))
- [Android 공식 Document: unregistContentResolver](https://developer.android.com/reference/android/content/ContentResolver#unregisterContentObserver(android.database.ContentObserver))
- [ContentObserver 뭐하는 녀석인지 알아봅시다.](https://aroundck.tistory.com/129)

<br>
