---
title: "Room - Android Local Database"
date: "2020-12-26"
tags: ["mash-up", "mash-up 10기", "hyeonseong", "room"]
description: "안드로이드 로컬 데이터베이스 룸에 대해 정리해보겠습니다 !!"
cover: "./cover.png"
---

# Room - Android Local Database

🙇 **안녕하세요 ! **

**Mash-Up 10기 Android Developer 정현성 인사드립니다.** 🙇

_이번 포스팅 주제로 무엇을 할까 고민을 하다,,,,_

_최근 취업 준비를 하며 그동안 개발했던 애플리케이션들을 하나의 포트폴리오로 보여주는 애플리케이션을 개발한 적이 있습니다._

_개발하며 사용했던 기술 스택 중 하나인 Room에 대해 다시 정리해볼 겸 포스팅 주제로 선정하였습니다._

---

## 💾 _Local Database_

안드로이드에서는 앱의 데이터를 효율적으로 관리하기 위한 저장소로 SQLite라는 데이터베이스를 제공하고 있습니다. 이는 다른 외부 Database들과 달리 소규모 데이터를 관리하고 사용하는 데 적합한 관계형 데이터베이스입니다. 예를 들어, 애플리케이션 사용 과정에서 발생하는 용량이 크지 않은 데이터들은 굳이 서버에 접속하고 저장하는 수고를 들이지 않고 내부 데이터베이스를 통해 저장하고 관리할 수 있습니다. 이렇게 적은 데이터를 관리하는데 최적화된 만큼 속도가 빠르고 가볍다는 장점이 존재하여 현시점의 많은 애플리케이션이 공통으로 내부 DB를 활용하고 있습니다.

> **Local Database 종류**

<span style="color:red">_SQLite Database Library, Room Database Library_</span>

안드로이드에서 Local Database를 구현하는 방법으로, SQLite Database Library 사용을 권장해왔습니다.

<img src="room_img/sqlite.png" width="1000">

하지만 이를 사용하기 위해서는 상당한 시간과 노력 등 사용 방법이 복잡하여, 구글에서는 이러한 문제를 해결하고자 새롭게 Room Database Library를 배포하였습니다.

```
👏 Room에 새롭게 추가된 기능

1. 컴파일 시점에 SQL 쿼리에 대한 유효성 검사 기능
2. Schema가 변경될 시 자동으로 업데이트 기능
3. Java 데이터 객체를 변경하기 위해 상용구 코드 없이 ORM 라이브러리를 통해 매핑 기능
4. LiveData와 Rx Java를 위한 Observation 생성 및 동작 기능
```

위와 같이 SQLite Database Library에서는 허용되지 않던 기능들이 새롭게 추가되면서 조금 더 개발자들이 Local DB를 간편하게 구현할 수 있도록 설계된 모습을 볼 수 있습니다. 그에 따라 SQLite Database의 사용 빈도는 줄어들고, Room Database의 사용 빈도는 증가하고 있습니다.

---

## 💽 _Room Library_

> **ORM이란?**

먼저, Room을 자세히 알아보기 전에 ORM에 대한 개념을 간단히 살펴볼 필요가 있습니다.

- **Object-Relational Mapping**

  ORM이란, Object Relational Mapping, 객체-관계 매핑의 줄임말입니다. 객체 지향 프로그래밍(Object Oriented Programming, OOP)은 클래스를 사용하고, 관계형 데이터베이스(Relational DataBase, RDB)는 테이블을 사용합니다. 이러한 객체 모델과 관계형 모델 간에 불일치가 존재하게 되는데, ORM을 통해 객체 간의 관계를 바탕으로 SQL문을 자동으로 생성하여 불일치를 해결할 수 있습니다.

- **장점**

  1. 객체 지향적인 코드로 인해 더 직관적이고, 비즈니스 로직에 집중할 수 있다.
  2. 재사용성 및 유지보수의 편리성이 증가한다.

- **단점**
  1. 완벽한 ORM으로만 서비스를 구현하기가 어렵다.
  2. 프로시저가 많은 시스템에서는 ORM의 객체 지향적인 장점을 활용하기 어렵다.

> **Room이란?**

안드로이드 아키텍쳐 컴포넌트(Android Architecture Components, AAC)에 속하는 Room은 애플리케이션에서 SQLite 데이터베이스를 쉽고 편리하게 사용할 수 있도록 하는 ORM 라이브러리입니다.

> **Room Library 구성요소**

엔티티(Entity), 데이터 접근 객체(DAO), 룸 데이터베이스(Room Database), 총 세 개의 구성 요소를 통해 Room 데이터베이스 라이브러리가 구성됩니다.

<img src="room_img/room_diagram.png" width="1000">

- Entity

  데이터베이스 내의 릴레이션 즉, 테이블을 뜻하며 DB에 저장할 데이터 형식을 정의합니다.

* DAO(Data Access Object)

  데이터베이스에 접근하여 수행할 작업을 메소드 형태로 정의합니다.

- Room Database

  데이터베이스의 전체적인 소유자 역할을 하며 DB를 새롭게 생성하거나 버전을 관리합니다.

---

## 💻 _예제 살펴보기_

Room Database를 활용하여 포트폴리오 애플리케이션을 구현하였습니다.

<img src="room_img/database.png" width="250">

```
- Entity (데이터베이스의 테이블 담당)

  PortfolioEntity, ProfileEntity

- DAO (각각의 테이블에 접근하여 작업 수행을 담당)

  PortfolioDao, ProfileDao

- Room Database (데이터베이스의 전체적인 소유자 역할)

  PortfolioDatabase

```

데이터베이스 구성요소 입니다.

> **Build.Gradle 설정하기**

```kotlin
dependencies {
  	//Room Database Library
    implementation "androidx.room:room-runtime:2.2.6"
    implementation "androidx.room:room-ktx:2.2.6"
    implementation "androidx.room:room-testing:2.2.6"
    kapt "androidx.room:room-compiler:2.2.6"
}
```

> **PortfolioEntity**

```kotlin
@Entity(tableName = "portfolio")
data class PortfolioEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long,
    @ColumnInfo(name = "thumbnail")
    val thumbnail: Int,
    @ColumnInfo(name = "image_drawable")
    val image: String,
    @ColumnInfo(name = "project")
    val project: String,
    @ColumnInfo(name = "introduction")
    val introduction: String,
    @ColumnInfo(name = "programming_language")
    val programming: String,
    @ColumnInfo(name = "architecture")
    val architecture: String,
    @ColumnInfo(name = "library")
    val library: String,
    @ColumnInfo(name = "server")
    val server: String,
    @ColumnInfo(name = "term")
    val term: String,
    @ColumnInfo(name = "link")
    val link: String
)
```

@Entity 어노테이션과 함께 데이터베이스 내의 릴레이션(테이블)을 생성하고 있습니다. 클래스의 이름은 <span style="color:red">_PortfolioEntity_</span>이지만 tableName을 <span style="color:red">_portfolio_</span>로 설정하였기 때문에 클래스 이름과는 별개로 위 데이터베이스 내의 릴레이션 이름은 <span style="color:red">_portfolio_</span>로 설정됩니다. 또한, 클래스의 생성자로 릴레이션 내의 각각의 속성들을 정의하고 있습니다.

> **PortfolioDao**

```kotlin
@Dao
interface PortfolioDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPortfolio(portfolioEntity: PortfolioEntity)

    @Query("SELECT * FROM portfolio")
    suspend fun getPortfolio(): List<PortfolioEntity>

    @Query("SELECT * FROM portfolio WHERE id = :id")
    suspend fun getPortfolioInfo(id: Long): PortfolioEntity

}
```

@Dao 어노테이션과 함께 데이터베이스에 접근하여 수행할 작업들을 메서드 형태로 지정합니다. 이 메소드들은 interface 내에 포함되므로 모두 추상 메소드들이며 조회, 추가, 수정, 삭제 기능( <span style="color:yellow">_저는 추가, 조회 기능만 구현했습니다._</span> )을 구현합니다.

또한, insert 메소드 부분을 보면, onConflict 설정을 통해 만약 데이터베이스 내에 중복된 데이터 값이 존재한다면, 그 값 위에 덮어 씌우는 설정을 해두었습니다.

> **PortfolioDatabase**

```kotlin
@Database(
    entities = [
        ProfileEntity::class,
        PortfolioEntity::class
    ],
    version = VERSION,
    exportSchema = false
)

abstract class PortfolioDatabase : RoomDatabase() {

    abstract fun profileDao(): ProfileDao
    abstract fun portfolioDao(): PortfolioDao

    companion object {
        const val VERSION = 1
        private const val TABLE_NAME = "portfolio_db"

        @Volatile
        private var instance: PortfolioDatabase? = null

        fun getInstance(context: Context): PortfolioDatabase {
            return instance ?: synchronized(this) {
                instance ?: buildDatabase(context).also { instance = it }
            }
        }

        private fun buildDatabase(context: Context): PortfolioDatabase {
            return Room.databaseBuilder(context, PortfolioDatabase::class.java, TABLE_NAME)
                .build()
        }
    }

}
```

@Database 어노테이션과 함께 데이터베이스의 전체적인 소유자 역할을 하고 있으며 앞에서 생성한 Entity, DAO 클래스를 통합적으로 묶어 데이터베이스를 생성하거나 버전 관리를 담당합니다.

> **Dagger DI ( 의존성 주입에 대한 설명은 생략하겠습니다 :( ) **
>
> > **DatabaseModule**
> >
> > ```kotlin
> > @Module
> > class DatabaseModule {
> >
> >    @Singleton
> >    @Provides
> >    fun providesPortfolioDatabase(context: Context): PortfolioDatabase =
> >        PortfolioDatabase.getInstance(context)
> >
> >    @Singleton
> >    @Provides
> >    fun providesPortfolioDao(db: PortfolioDatabase): PortfolioDao = db.portfolioDao()
> >
> > }
> > ```
> >
> > @Singleton 어노테이션을 통해, 생성자가 여러 차례 호출되더라도 실제로 생성되는 객체는 하나이고, 최초 생성 이후에 호출된 생성자는 최초의 생성자가 생성한 객체를 리턴하도록 하였습니다.
>
> > **PortfolioRepository**
> >
> > ```kotlin
> > interface PortfolioRepository {
> >
> >    suspend fun insertPortfolio(portfolio: Portfolio)
> >
> >    suspend fun getPortfolio(): List<Portfolio>
> >
> >    suspend fun getPortfolioInfo(id: Long): Portfolio
> >
> > }
> > ```
>
> > **PortfolioRepositoryImpl**
> >
> > ```kotlin
> > class PortfolioRepositoryImpl(
> >    private val portfolioDao: PortfolioDao
> > ) : PortfolioRepository {
> >
> >    override suspend fun insertPortfolio(portfolio: Portfolio) =
> >        portfolioDao.insertPortfolio(portfolio.mapPortfolioEntity())
> >
> >    override suspend fun getPortfolio(): List<Portfolio> =
> >        portfolioDao.getPortfolio().mapPortfolioList()
> >
> >    override suspend fun getPortfolioInfo(id: Long): Portfolio =
> >        portfolioDao.getPortfolioInfo(id).mapPortfolio()
> >
> > }
> > ```
>
> > **PortfolioMapper**
> >
> > ```kotlin
> > fun Portfolio.mapPortfolioEntity(): PortfolioEntity =
> >    PortfolioEntity(
> >        id,
> >        thumbnail,
> >        image,
> >        project,
> >        introduction,
> >        programming,
> >        architecture,
> >        library,
> >        server,
> >        term,
> >        link
> >    )
> >
> > fun PortfolioEntity.mapPortfolio(): Portfolio =
> >    Portfolio(
> >    		id,
> >    		thumbnail,
> >    		image,
> >    		project,
> >    		introduction,
> >    		programming,
> >    		architecture,
> >    		library,
> >    		server,
> >    		term,
> >    		link
> >    )
> >
> > fun List<PortfolioEntity>.mapPortfolioList(): List<Portfolio> =
> >    map { it.mapPortfolio() }
> > ```
> >
> > 가져온 Data를 Mapping하는 매소드입니다.

> **SampleData**

```
val INIT_PORTFOLIO: List<Portfolio> = listOf(
	Portfolio(
		..
	),
	Portfolio(
		..
	),
		..
)
```

> **HomeViewModel**

```kotlin
class HomeViewModel @Inject constructor(
	private val portfolioRepository: PortfolioRepository
) : ViewModel() {

  private val portfolio = MediatorLiveData<List<Portfolio>>()

  private val _homePortfolioUiModel = MediatorLiveData<List<HomePortfolioUiModel>>()
  val homePortfolioUiModel: LiveData<List<HomePortfolioUiModel>>
        get() = _homePortfolioUiModel

  init {
    _homePortfolioUiModel.addSource(portfolio) {
      _homePortfolioUiModel.value = it.mapToHomePortfolioUiModel()
    }
  }

  private fun insertPortfolio() {
    viewModelScope.launch {
      INIT_PORTFOLIO.iterator().forEach {
        portfolioRepository.insertPortfolio(it)
      }
    }

    portfolio.value = INIT_PORTFOLIO
  }

  private fun getPortfolio() {
    viewModelScope.launch {
      portfolio.value = portfolioRepository.getPortfolio()
    }
  }
}

```

---

이번 포스팅을 통해 SQLite Database에 비해 Room Database가

성능면에서도 뛰어나고 편리하고 직관적인 코드를 작성할 수 있다는 것을 체감할 수 있었습니다 :)

그럼 👋

---

## 📖 _Reference_

[Room_Blog](https://juyeop.tistory.com/30)

[Room_Google Developers](https://developer.android.com/training/data-storage/room?hl=ko)

[ORM_Blog](https://velog.io/@dnjscksdn98/Database-ORM%EC%9D%B4%EB%9E%80)
