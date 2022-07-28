---
title: "Infinite Scroll with Paging Library"
date: "2022-07-28"
tags: ["mash-up", "hyunsu", "paging", "Infinite Scroll"] 
description: "Paging 라이브러리를 통해 무한 스크롤을 구현해보자~"
cover: "./images/blog_title_hyunsu.png"
---

안녕하세요. 안드로이드팀 12기 김현수입니다. 

저는 무한스크롤을 ScrollListener로 원래는 구현했었는데 이번에 Android Paging Library를 공부하여서  Paging을 사용한 무한스크롤을 구현을 포스팅하고자 합니다.

## Jetpack Paging Library

Android Jetpack 에서는 페이징을 위한 라이브러리를 제공합니다. Paging은 구글에서 권장하는 Android 앱 아키텍처에 맞게 설계되어 있으며, 다른 Jetpack 컴포넌트와 잘 동작할 수 있도록 설계되어 있습니다.

페이징 라이브러리를 사용하여 얻을수 있는 이점은 다음과 같습니다.

- 페이징된 데이터의 메모리 내 캐싱. 이렇게 하면 앱이 페이징 데이터로 작업하는 동안 시스템 리소스를 효율적으로 사용할 수 있습니다.
- 요청 중복 제거 기능이 기본으로 제공되어 앱에서 네트워크 대역폭과 시스템 리소스를 효율적으로 사용할 수 있습니다.
- 사용자가 로드된 데이터의 끝까지 스크롤할 때 구성 가능한 RecyclerView 어댑터가 자동으로 데이터를 요청합니다.
- Kotlin 코루틴 및 Flow뿐만 아니라 LiveData 및 RxJava를 최고 수준으로 지원합니다.
- 새로고침 및 재시도 기능을 포함하여 오류 처리를 기본으로 지원합니다.

라이브러리 아키텍처는 3가지의 레이어에서 작동합니다.

- Repository layer
- ViewModel layer
- UI layer

![Untitled](./images/paging_layer.jpg.png)

### Repository layer

Repository layer의 기본 페이징 라이브러리 구성요소는 PagingSource 입니다. 각 PagingSource 객체는 데이터 소스와 이 소스에서 데이터를 검색하는 방법을 정의합니다. PagingSource 객체는 네트워크 소스 및 로컬 DB를 포함한 단일 소스에서 데이터를 로드할 수 있습니다.

 사용할 수 있는 다른 페이징 라이브러리 구성요소는 RemoteMediator 입니다. RemoteMediator 객체는 로컬 DB 캐시가 있는 네트워크 데이터 소스와 같은 계층화된 데이터 소스의 페이징을 처리합니다.

이 포스팅에선 PagingSource만 사용하였습니다.

### ViewModel layer

Pager 구성요소는 PagingSource 객체 및 PagingConfig 구성 객체를 바탕으로 반응형 스트림에 노출되는 PagingData 인스턴스를 구성하기 위한 공개 API를 제공합니다.

ViewModel 레이어를 UI에 연결하는 구성요소는 PagingData입니다. PagingData 객체는 페이지로 나눈 데이터의 스냅샷을 보유하는 컨테이너 입니다. PagingSource 객체를 쿼리하여 결과를 저장합니다.

### UI layer

UI 레이어의 기본 페이징 라이브러리 구성요소는 페이지로 나눈 데이터를 처리하는 RecyclerView 어댑터 인 PagingDataAdapter입니다.

또한 포함된 AsyncPagingDataDiffer 구성요소를 사용하여 고유한 맞춤 어댑터를 빌드할 수 있습니다.

### Paging 라이브러리 핵심 구성요소

주요 클래스에 관한 설명은 아래와 같습니다.

- Paging Source : 특정 페이지 쿼리의 데이터 청크를 로드하는 기본 클래스로 데이터 레이어의 일부이며 일반적으로 DataSource 클래스에서 노출되고 이후에 ViewModel에서 사용하기 위해 Repository에 의해 노출됩니다.
- PagingConfig : 페이징 동작을 결정하는 매개변수를 정의하는 클래스로 페이지 크기, PlaceHolder의 설정 여부 등이 포함됩니다.
- Pager : PagingData 스트림을 생성하는 클래스로 PagingSource에 따라 다르게 실행되며 ViewModel에서 만들어야 합니다.
- PagingData : 페이지로 나눈 데이터의 컨테이너로 데이터를 새로고침할 때마다 자체 PagingSource로 지원되는 해당 PagingData가 생성됩니다.
- PagingDataAdapter : RecyclerView에 PagingData를 표시하는 RecyclerView.Adapter 서브클래스로 PagingDataAdapter는 팩토리 메서드를 사용하여 Flow나 LiveData, Observable 또는 정적 목록에도 연결 가능합니다. PagingDataAdpater는 내부 PagingData 로드 이벤트를 수신 대기하고 페이지가 로드될 때 UI를 효율적으로 업데이트합니다.

---

그럼 이론은 이쯤하고 실제로 적용해보도록 합시다.

Unsplash api를 이용하여 android 검색에 관한 사진들을 받아오는 앱을 만들어 보겠습니다.

![sample.gif](./images/sample.gif)

먼저 의존성을 추가합니다.

```kotlin
dependencies {
  val paging_version = "3.1.1"

  implementation("androidx.paging:paging-runtime:$paging_version")

  // alternatively - without Android dependencies for tests
  testImplementation("androidx.paging:paging-common:$paging_version")

  // optional - RxJava2 support
  implementation("androidx.paging:paging-rxjava2:$paging_version")

  // optional - RxJava3 support
  implementation("androidx.paging:paging-rxjava3:$paging_version")

  // optional - Guava ListenableFuture support
  implementation("androidx.paging:paging-guava:$paging_version")

  // optional - Jetpack Compose integration
  implementation("androidx.paging:paging-compose:1.0.0-alpha15")
}
```

사용된 DTO는 다음과 같습니다.

```kotlin
data class Response(
    @SerializedName("total")
    val total : Int,
    @SerializedName("total_pages")
    val pages : Int,
    @SerializedName("results")
    val results : List<Picture>
)

data class Picture(
    @SerializedName("id")
    val id: String,
    @SerializedName("urls")
    val url: Url
)

data class Url(
    @SerializedName("thumb")
    val url: String
)
```

Unsplash의 사진 리스트를 받아오는 서비스 입니다.

```kotlin
interface UnsplashService {

    @GET("search/photos")
    suspend fun getPhotoList(
        @Query("page") page: Int,
        @Query("query") query: String = "android",
        @Query("client_id") key: String = "키 값",
        @Query("per_page") perPage: Int = PAGE_SIZE
    ): Response
}
```

---

이제 가장 먼저 PagingSource를 추가해 봅시다.

PagingSource를 빌드하려면 다음 항목의 유형을 정의해야 합니다.

- 페이징 키의 유형: 추가 데이터를 요청하는 데 사용하는 페이지 쿼리 유형의 정의
- 로드된 데이터의 유형
- 데이터를 가져오는 위치: 일반적으로 데이터베이스나 네트워크 리소스, 페이지로 나눈 데이터의 다른 소스

또 PagingSource 에서는 두 가지 함수를 구현해야 합니다. 

```kotlin
override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Picture> {
        TODO("Not yet implemented")
    }
   override fun getRefreshKey(state: PagingState<Int, Picture>): Int? {
        TODO("Not yet implemented")
    }
```

load()는 params을 바탕으로 페이지의 데이터를 반환하게 됩니다. getRefreshKey()는 refresh 시 다시 시작할 key를 반환해주면 됩니다.

먼저 load()를 구현해 봅시다.

```kotlin
const val STARTING_KEY = 1

...

override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Picture> {
        val position = params.key ?: STARTING_KEY
        return try {
            val pictures = unsplashService.getPhotoList(position).results
            LoadResult.Page(
                data = pictures,
                prevKey = if (position == STARTING_KEY) null else position - 1,
                nextKey = if (pictures.isEmpty()) null else position + 1
            )
        } catch (e: IOException) {
            return LoadResult.Error(e)
        }
    }
```

LoadParams 객체에는 다음 항목을 포함하여 로드 작업과 관련된 정보가 저장되어있습니다.

- 로드할 페이지의 키: load()가 처음 호출되는 경우 LoadParams.key 는 null 입니다.
- 로드 크기: 로드 요청된 항목의 수

load() 함수는 LoadResult를 반환하는데 세가지 중 하나일 수 있습니다.

- LoadResult.Page : 로드에 성공한 경우
- LoadResult.Error : 오류가 발생한 경우
- LoadResult.Invalid : PagingSource가 더 이상 결과의 무결성을 보장할 수 없으므로 무효화되어야 하는 경우

여기선 성공인 Page와 Error만 구현하였습니다.

Page에는 필수의 세가지 인자가 있습니다.

- date : 가져온 항목의 List
- prevKey : 현재 페이지 앞에 항목을 가져와야 하는 경우 load() 메서드에서 사용하는 키
- nextKey : 현재 페이지 뒤에 항목을 가져와야 하는 경우 load() 메서드에서 사용하는 키

사용하진 않았지만 선택적인 인자도 두개 있습니다. 

- itemBefore : 로드된 데이터 앞에 표시할 placeHolder의 수
- itemAfter : 로드된 데이터 뒤에 표시할 placeHolder의 수

prevKey는 현재 position이 STARTING_KEY와 같은 경우 null, 아니면 position -1을 해줍니다.

nextKey는 무한으로 로드하기 때문에 더 아오지 못한경우 null 아니면 position +1을 해줍니다.

다음으로 getRefreshKey()를 완성해 봅시다.

```kotlin
override fun getRefreshKey(state: PagingState<Int, Picture>): Int? {
				// 페이지의 이전 키(또는 이전이 null 인경우 다음 키)를 가져와야 합니다. 
        return state.anchorPosition?.let { position ->
            state.closestPageToPosition(position)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(position)?.nextKey?.minus(1)
        }
    }
```

새로고침은 DB업데이트, 구성변경, 프로세스 중단, 스와이프 등으로 인해 무효화 되어 Paging라이브러리가 현재 목록을 대체할 새 데이터를 로드하려고 할 때마다 발생합니다

getRefreshKey()는 PagingSource.load()의 후속 새로고침 호출에 사용됩니다. 첫 번째 호출은 Pager에 의해 제공되는 initialKey를 사용하는 초기로드입니다.  .

PagingState는 로드된 페이지 및 마지막으로 엑세스한 위치 등의 페이징 시스템의 스냅샷 상태를 가지고 있습니다.

일반적으로 후속 새로고침은 가장 최근에 엑세스한 인덱스를 나타내는 PagingState.anchorPosition 주변 데이터의 로드를 다시 시작하려고 합니다.

완성된 PagingSource는 다음과 같습니다.

```kotlin
const val STARTING_KEY = 1

class PicturePagingSource(
    private val unsplashService: UnsplashService
) : PagingSource<Int, Picture>() {

    override fun getRefreshKey(state: PagingState<Int, Picture>): Int? {
        return state.anchorPosition?.let { position ->
            state.closestPageToPosition(position)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(position)?.nextKey?.minus(1)
        }
    }

    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Picture> {
        val position = params.key ?: STARTING_KEY
        return try {
            val pictures = unsplashService.getPhotoList(position).results
            LoadResult.Page(
                data = pictures,
                prevKey = if (position == STARTING_KEY) null else position - 1,
                nextKey = if (pictures.isEmpty()) null else position + 1
            )
        } catch (e: Exception) {
            return LoadResult.Error(e)
        }
    }

}
```

---

다음은 PagingData 생성단계입니다.

Repository에서 Pager와 PagingSource를 사용하여 PagingData로 반환해 줍니다.

```kotlin
interface PictureRepository {

    fun getPictureList(): Flow<PagingData<Picture>>

}
```

```kotlin
class PictureRepositoryImpl @Inject constructor(
    private val service: UnsplashService
) : PictureRepository {

    companion object {
        const val PAGE_SIZE = 30
    }

    override fun getPictureList(): Flow<PagingData<Picture>> =
        Pager(PagingConfig(PAGE_SIZE)) {
            PicturePagingSource(service)
        }.flow

}
```

PagingData는 로드된 데이터를 래핑하고 Paging 라이브러리가 추가 데이터를 가져올 시기를 결정하는데 도움을 주는 유형이며 동일한 페이지를 두 번 요청하지 않도록 합니다.

PagingData를 구성하기 위해 PagingData를 앱의 다른 레이어에 전달하는 데 사용할 API에 따라 Pager 클래스의 여러 빌더 메서드 중 하나를 사용 합니다.

- Kotlin Flow - Pager.flow
- LiveData - Pager.liveData
- RxJava Flowable - Pager.flowable
- RxJava Observable - Pager.obsevable

사용하는 빌더에 관계없이 다음 매개변수를 꼭 전달해주어야 합니다.

- PagingConfig : 로드 대기시간, 초기 로드의 크기 요청 등 PagingSource에서 콘텐츠를 로드하는 방법에 관한 옵션을 설정합니다. 페이지 크기는 필수로 정의해주어야 합니다. 기본적으로 Paging은 로드하는 모든 페이지를 메모리에 유지하는데 사용자가 스크롤할 때 메모리를 낭비하지 않으려면 PagingConfig 에서 maxSize 매개변수를 설정해야 합니다. Paging은 placeholder를 지정할 수 있는데 저는 Glide에서 해주었습니다^^
- PagingSource를 만드는 방법을 정의하는 함수. 여기서 새PicturePageSource를 만듭니다.

---

이제 ViewModel에서 PagingData를 가져옵시다.

```kotlin
class PictureFlowUseCase @Inject constructor(
    private val pictureRepository: PictureRepository
) {
    operator fun invoke() = pictureRepository.getPictureList()
        .flowOn(Dispatchers.Default)
}
```

```kotlin
@HiltViewModel
class PagingViewModel @Inject constructor(
    private val pictureFlowUseCase: PictureFlowUseCase
) : ViewModel() {

    private val _picList = MutableStateFlow<PagingData<Picture>>(PagingData.empty())
    val picList = _picList.asStateFlow()

    fun getPictureList() {
        viewModelScope.launch {
            pictureFlowUseCase()
                .cachedIn(viewModelScope)
                .collectLatest { picture ->
                    _picList.emit(picture)
                }
        }
    }
}
```

cachedIn()은 데이터 스트림을 공유 가능하게 하며 제공된 CoroutineScope를 사용하여 로드된 데이터를 캐시합니다. 여기서는 viewModelScope를 사용하였습니다.

---

 PagingData를 표시하기위한 PagingDataAdapter를 구현합시다

```kotlin
class PicturePagingAdapter : PagingDataAdapter<Picture, PictureViewHolder>(PICTURE_DIFF_CALLBACK) {

    override fun onBindViewHolder(holder: PictureViewHolder, position: Int) {
        getItem(position)?.let { holder.bind(it) }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PictureViewHolder {
        return PictureViewHolder(
            ItemPicBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        )
    }

    companion object {
        private val PICTURE_DIFF_CALLBACK = object : DiffUtil.ItemCallback<Picture>() {
            override fun areItemsTheSame(oldItem: Picture, newItem: Picture): Boolean =
                oldItem.id == newItem.id

            override fun areContentsTheSame(oldItem: Picture, newItem: Picture): Boolean =
                oldItem == newItem

        }
    }

}

class PictureViewHolder(
    private val binding: ItemPicBinding
) : RecyclerView.ViewHolder(binding.root) {
    fun bind(item: Picture) {
        binding.apply {
            picture = item
            executePendingBindings()
        }
    }
}
```

PagingDataAdapter 는 ListAdapter와 비슷하게 사용하면 됩니다.

이제 프래그먼트에서 어댑터를 설정하고 PagingData를 collect 해주면 끝입니다.

```kotlin
private fun initRecyclerView() {
	binding.rvPicture.apply {
			layoutManager = GridLayoutManager(requireContext(), 2)
	    adapter = picturePagingAdapter
	}
}

private fun collectFlows() {
	lifecycleScope.launch {
		viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
			launch {
		      viewModel.picList.collectLatest { picture ->
		        picturePagingAdapter.submitData(picture)
					}
			}
      
			launch {
		      picturePagingAdapter.loadStateFlow
	          .collectLatest {
	            if (it.source.append is LoadState.Loading) dialog.show()
              else dialog.dismiss()
						}
			}
	}
}
```

PagingData콘텐츠가 로드될 때마다 PagingDataAdapter에서 알림을 받은 다음 RecyclerView에 업데이트하라는 신호를 보냅니다.

Paging 라이브러리는 CombinedLoadState 유형으로 로드 상태에 간단하게 엑세스 하는 방법을 제공 하는데 CombinedLoadState 인스턴스는 데이터를 로드하는 Paging 라이브러리에 있는 모든 구성요소의 로드 상태를 설명합니다.

여기에선 PicturePagingSource의 LoadState에만 이용하여 CombinedLoatStates.source필드의 LoadStates를 사용합니다. PagingAdapter.loadStateFlow를 사용하여 PagingDataAdapter를 통한 CombinedLoadStates에 엑세스 합니다.

CombinedLoadStates.source에는 LoadStates 유형으로 세자기 LoadState필드가 있습니다.

- LoadStates.append: 사용자의 현재 위치 후에 가져오는 항목의 LoadState용
- LoadState.prepend: 사용자의 현재 위치 전에 가져오는 항목의 LoadState용
- LoadState.refresh: 초기 로드의 LoadState용

또한 각 LoadState는 Loading, NotLoading, Error 중 하나의 상태를 가집니다.

여기선 Loading 상태만 다루었습니다.

```kotlin
const val DELAY_MILLIS = 1_000L

...

override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Picture> {
        val position = params.key ?: STARTING_KEY
				// 1초의 지연시간 시뮬레이션
        if (position != STARTING_KEY) delay(DELAY_MILLIS)
				
				...
```

마지막으로 PicturePagingSource에 약간의 지연을 추가하여 로딩을 시뮬레이션 합니다.

---

## 마무리

원래는 ScrollListener을 사용하여 무한스크롤을 구현했었는데 제가 코드를 잘 못짜는 것도 있겠지만 Paging 라이브러리를 사용해보니 위의 장점처럼 레이어를 구분하여 구조적으로 뭔가 좀 더 깔끔한 맛이 나는 것 같았습니다! 대신 그만큼 더 귀찮고 복잡했는데 물론 구현하는데 구조적으로 좀 더 공부하게 되었던 시간이었습니다 ^오^

### 참고

[https://developer.android.com/topic/libraries/architecture/paging/v3-overview?hl=ko](https://developer.android.com/topic/libraries/architecture/paging/v3-overview?hl=ko)

[https://developer.android.com/codelabs/android-paging-basics?hl=ko#9](https://developer.android.com/codelabs/android-paging-basics?hl=ko#9)

[https://developer.android.com/codelabs/android-paging?hl=ko](https://developer.android.com/codelabs/android-paging?hl=ko)

[https://leveloper.tistory.com/202](https://leveloper.tistory.com/202)

[https://github.com/leejieun1121/github-search](https://github.com/leejieun1121/github-search)

[https://unsplash.com/documentation](https://unsplash.com/documentation)
