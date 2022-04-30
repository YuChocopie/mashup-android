---

title: Android AdMob Native Ad

date: "2021-10-31"

tags: ["minuk", "mash-up", "android", "paging 3", "Native Ad"]

description: "Native 광고로 돈벌어보자~"
cover: "native.png"

---

안녕하세요 MashUp 11기 양민욱입니다.:)

좋은 앱 서비스를 완성했다면 그다음 고민은 수익 모델이죠. AWS 등 클라우드 서비스를 통해 서버를 구축했다면 다달이 나오는 서버 비용을 무시할 수 없기 때문이에요... 그렇기 때문에 우리 Android 개발자들은 Admob 광고 SDK를 앱에 잘 녹여들 수 있게 고민을 시작해야 합니다.

!!!? 갑자기 **Admob**.. 왜..?

그 이유는 최근 Admob 네이티브 광고를 개인 프로젝트에 적용하느라 **아주 고생을 많이 했기 때문이에요...**

라이브러리 자체를 적용하는 것은 어렵지 않아요. 하지만 우리 프로젝트 앱들은  모든 코드가 Activity class 하나 파일에 들어가 있는 형태는 아니잖아요? 여러 가지 다양하고 복잡한 구조로 구성되어 있는 데, [공식 문서](https://developers.google.com/admob/android/native?hl=ko)에서 설명하는 내용은 간단하게 사용하는 방법뿐이고 커스텀하게 이용할 수 있는 방법이 없더라고요.  그래서 AdMob을 적용하는 방법과 그 과정에서 고민했던 부분, 그에 대한 해결책에 대해서 포스팅을 작성해봅니다.

그럼 시작해볼까요..?

#### **AdMob 네이티브  광고란?**

Admob에 대해서 알고 있으신가요? 모바일 앱에 특화된 광고 SDK로 Google에서 개발되었어요!

가장 쉽게 적용할 수 있는 광고는 배너와 보상형 광고지만 UX/UI 등이 마음대로 커스텀할 수 없기 때문에 앱의 전체적인 디자인을 해치게 되고 사용자에게 단순히 돈을 벌기 위한 앱 정도로 인식하게 돼버린다고 생각해요. 그래서 저는 개발자가 직접 UI를 커스텀 가능한 **네이티브 광고**를 선택했어요**.**

지금부터는 간단한 AdMob Sdk를 Android 프로젝트에 추가하는 방법입니다. 공식 문서를 보고 진행하실 분은 [여기](https://developers.google.com/admob/android/quick-start)를 눌러주세요!

**AdMob 적용하기**

```
dependencies {
  implementation 'com.google.android.gms:play-services-ads:20.4.0'
}
```

```xml
<manifest>
    <application>
        <!-- Sample AdMob app ID: ca-app-pub-3940256099942544~3347511713 -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy"/>
    </application>
</manifest>
```

**앱 ID**와 **광고 ID**가 아직 없으신 분들은 [AdMob 홈페이지](https://apps.admob.com/v2/home?utm_source=internal&utm_medium=et&utm_campaign=helpcentrecontextualopt&utm_term=http%3A%2F%2Fgoo.gl%2F6Xkfcf&subid=ww-ww-et-amhelpv4)에 로그인하셔서 생성해주세요.

```kotlin
MobileAds.initialize(this) {}
```

AdMob을 초기화하는 코드로 앱 실행 시 최초 한번 실행해야 하는 코드입니다.

공식 문서에서는 MainActivity class 파일에 해당 코드가 포함되어 있지만 Application class에서 실행해도 문제없을 것 같습니다!

#### **AdMob 네이티브  광고 표시하기**

```kotlin
val adLoader = AdLoader.Builder(this, "광고 ID")
    .forNativeAd { ad : NativeAd ->
        // Show the ad.
    }
    .withAdListener(object : AdListener() {
        override fun onAdFailedToLoad(adError: LoadAdError) {
            // Handle the failure by logging, altering the UI, and so on.
        }
    })
    .withNativeAdOptions(NativeAdOptions.Builder()
            // Methods in the NativeAdOptions.Builder class can be
            // used here to specify individual options settings.
            .build())
    .build()
```

AdLoader 객체의 **forNativeAd 함수로** 네이티브 광고 정보가 담긴 NativeAd 객체에 접근할 수 있습니다.

recyclerView 뷰에 Item 데이터를 바인딩하듯이 **NativeAdView라는 객체**에 **NativeAd 객체 데이터를 바인딩시키면 됩니다**

사실 NativeAdView에 데이터를 바인딩하는 부분이 제일 오래 걸렸습니다. 방법을 알고 나니 굉장히 간단하고 단순한 방법이었는데요..

저는 처음에 adAppIcon이나 adHeadLine처럼 Id를 공식문서와 동일하게 설정해주면 이후 adView.setNativeAd(ad) 코드를 통해 자동으로 등록이 되는 줄 알았지만 아니더라고요.

Id는 자유롭게 작성하되 inflate 후 해당 뷰의 데이터를 바인딩하고 **NativeAdView 객체에 해당 View를 등록해줘야 합니다.**

예를 들어 아래처럼 하면 됩니다.

```kotlin
<Button
    android:id="@+id/ad_call_to_action"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:gravity="center"
    android:textSize="12sp" />



LayoutNativeAdBinding.inflate(LayoutInflater.from(context)).apply {
      root.apply { // root는 NativeAdView 객체입니다
          ...
          callToActionView = adCallToAction
          ...
       }

root.setNativeAd(nativeAds.ad)
```

광고 데이터를 바인딩하는 방법을 알게 되셨다면 남은 것은 우리 앱에 알맞은 네이티브 광고 UI입니다.

layout 파일은 공식문서에서도 잘 나와있지만 LinearLayout으로 구성되어 있어서 ConstraintLayout으로 수정한 저의 코드를 올려드리면서 마무리하겠습니다.

```xml
<com.google.android.gms.ads.nativead.NativeAdView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:minHeight="50dp"
        android:orientation="vertical">

        <TextView
            style="@style/Theme.Mokko.AdAttribution"
            android:layout_marginStart="16dp"
            android:layout_marginTop="16dp"
            app:layout_constraintBottom_toTopOf="@id/adAppIcon"
            app:layout_constraintStart_toStartOf="parent" />

        <ImageView
            android:id="@+id/adAppIcon"
            android:layout_width="40dp"
            android:layout_height="40dp"
            android:layout_marginStart="16dp"
            android:layout_marginTop="24dp"
            android:adjustViewBounds="true"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="parent"
            tools:ignore="ContentDescription" />

        <TextView
            android:id="@+id/adHeadline"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="8dp"
            android:layout_marginTop="24dp"
            android:layout_marginEnd="8dp"
            android:ellipsize="end"
            android:maxLines="1"
            android:minWidth="100dp"
            android:textColor="@color/gray_900"
            android:textSize="16sp"
            android:textStyle="bold"
            app:layout_constraintBottom_toBottomOf="@+id/adAppIcon"
            app:layout_constraintEnd_toStartOf="@id/actionLayout"
            app:layout_constraintStart_toEndOf="@id/adAppIcon"
            app:layout_constraintTop_toTopOf="parent" />

        <LinearLayout
            android:id="@+id/actionLayout"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:layout_marginEnd="16dp"
            android:orientation="vertical"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintTop_toTopOf="parent">

            <Button
                android:id="@+id/ad_call_to_action"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:gravity="center"
                android:textSize="12sp" />

            <TextView
                android:id="@+id/ad_store"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:maxLines="1"
                android:paddingStart="5dp"
                android:paddingLeft="5dp"
                android:paddingEnd="5dp"
                android:paddingRight="5dp"
                android:textSize="12sp" />

            <TextView
                android:id="@+id/ad_price"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:maxLines="1"
                android:paddingStart="5dp"
                android:paddingLeft="5dp"
                android:paddingEnd="5dp"
                android:paddingRight="5dp"
                android:textSize="12sp" />
       </LinearLayout>

        <TextView
            android:id="@+id/adAdvertiser"
            android:layout_width="wrap_content"
            android:layout_height="match_parent"
            android:layout_marginStart="16dp"
            android:layout_marginTop="4dp"
            android:textSize="14sp"
            android:textStyle="bold"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/adAppIcon" />

        <RatingBar
            android:id="@+id/adStars"
            style="?android:attr/ratingBarStyleSmall"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:isIndicator="true"
            android:numStars="5"
            android:stepSize="0.5"
            app:layout_constraintBottom_toBottomOf="@id/adAdvertiser"
            app:layout_constraintStart_toEndOf="@id/adAdvertiser"
            app:layout_constraintTop_toTopOf="@id/adAdvertiser" />

        <TextView
            android:id="@+id/adBody"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginHorizontal="16dp"
            android:textSize="12sp"
            app:layout_constraintEnd_toStartOf="@+id/actionLayout"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/adStars" />

        <com.google.android.gms.ads.nativead.MediaView
            android:id="@+id/adMedia"
            android:layout_width="0dp"
            android:layout_height="175dp"
            android:layout_gravity="center_horizontal"
            android:layout_marginHorizontal="16dp"
            android:layout_marginTop="5dp"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/adBody" />

    </androidx.constraintlayout.widget.ConstraintLayout>
</com.google.android.gms.ads.nativead.NativeAdView>
```

#### **Paging 3 라이브러리를 사용한 스크롤 목록에서 Native Ad 중간에 보여주기**

무한 스크롤되는 리스트 목록 중간중간에 네이티브 광고를 넣으려면 어떻게 해야 할까요?

요즘 Paging 3 라이브러리를 사용하여 무한 스크롤을 구현하는 데 해당 라이브러리 자체가 외부에서 데이터 수정이나 접근이 쉽지 않아 많이 고민했던 문제입니다. 구글링을 많이 해봤지만 관련된 CodeLab이나 블로그 게시글이 적어 제가 해결한 방법이 정답인지 효율적인지 잘 모르겠지만 소개해드리고 마무리하겠습니다...

우선 저는 **PagingSource**에서 광고를 불러와 서버 API 결과로 받은 리스트 중간에 넣어주는 작업을 진행했습니다.

PagingSource는 리스트에 표시되는 하나의 데이터 클래스를 반환해야 하기 때문에 sealed class로 일반적인 리스트 데이터 클래스와 광고 데이터 클래스를 정의했습니다. 

```kotlin
sealed class SearchContentUi {
    data class ContentUi(
        val contentId: Int = 0,
        val siteName: String,
        val title: String,
        val content: String,
        val publicationTime: Long,
        val contentUrl: String
    ) : SearchContentUi()

    data class NativeAds(
        val ad: NativeAd
    ) : SearchContentUi()
}

fun Content.convertToContentUi() = SearchContentUi.ContentUi(
    contentId = contentId,
    siteName = siteName,
    title = title,
    content = content,
    publicationTime = publicationTime,
    contentUrl =  contentUrl
)
```

```kotlin
class ContentPagingSource(
    private val api: RealTimeService,
    private val adLoaderBuilder: AdLoader.Builder,
    private val query: String
) : PagingSource<Int, SearchContentUi>() {

    companion object {
        private const val DEFAULT_AD_INDEX = 3
    }

    override suspend fun load(
        params: LoadParams<Int>
    ): LoadResult<Int, SearchContentUi> {
        try {
            val nextPostId = params.key ?: 0
            val response = api.getSearchingResult(query, postId = nextPostId)

            val contentUiList = mutableListOf<SearchContentUi>().apply {
                addAll(
                    response.data.contents.map {
                        it.convertToContentUi()
                    }
                )

                val adIndex = min(DEFAULT_AD_INDEX, size)
                add(adIndex, SearchContentUi.NativeAds(getNativeAds(adLoaderBuilder)))
            }
       ....
    }
```

getNativeAds는 AdLoader를 이용해 광고 데이터를 가져오는 함수입니다. AdLoader 광고 불러오는 방식은 CallBack 방식이기 때문에 결과를 반환할 때까지 스레드를 지연시켜야 합니다. 이때 kotlin 언어에서는 suspendCancellableCoroutine과 callbackFlow 방식을 지원하는 데 전자는 단일 값을 반환할 때, 후자는 여러 값을 반환하고 싶을 때 사용하면 좋을 것 같습니다!

저는 리스트 10개당 광고 하나를 로드하기 때문에 suspendCancellableCoroutine을 사용하였습니다.

```kotlin
 private suspend fun getNativeAds(adLoaderBuilder: AdLoader.Builder) =
        suspendCancellableCoroutine<NativeAd> { emit ->
            val videoOptions = VideoOptions.Builder()
                .setStartMuted(false)
                .build()

            val adOptions = NativeAdOptions.Builder()
                .setVideoOptions(videoOptions)
                .build()

            adLoaderBuilder
                .withNativeAdOptions(adOptions)
                .forNativeAd { nativeAd ->
                    emit.resume(nativeAd) {}
                }.withAdListener(object : AdListener() {
                    override fun onAdFailedToLoad(adError: LoadAdError) {
                        emit.cancel()
                    }
                }).build().loadAd(AdManagerAdRequest.Builder().build())
}
```

#### **테스트 APP\_ID를 사용하여 안전하게 개발하기**

광고를 불러오기 위해 AdLoador.Builder 객체를 생성할 때 **광고 ID**를 넣어주는 것을 기억하시나요. 여기서 중요한 점은 우리는 개발하는 도중에 원하는 형태로 광고가 잘 나오는지**테스트를 해야 하는데**실제 광고를 로드할 때 사용하는 광고 ID를 사용하게 되면 Admob 계정이 정지가 될 수 있습니다. 따라서 테스트 광고 Id를 사용해서 개발해야 합니다.

저의 경우에는 발급받은 광고 ID와 테스트 ID를 strings 파일에 정의해두고 buildType에 따라서 광고 ID를 설정해주었습니다.

```kotlin
    @Provides
    fun provideNativeAdLoader(@ApplicationContext appContext: Context): AdLoader.Builder {
        val adsId = if (BuildConfig.DEBUG) {
            appContext.getString(R.string.admob_native_test_id)
        } else {
            appContext.getString(R.string.admob_native_id)
        }
        return AdLoader.Builder(appContext, adsId)
    }
```

tip. 에뮬레이터로 빌드하게 된다면 테스트 기기로 인식하여 별도의 처리 없이 테스트 광고가 나온다고 합니다.
