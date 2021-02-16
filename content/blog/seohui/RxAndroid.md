---
title: RxAndroid
date: "2021-02-16"
tags: ["RxJava", "mash-up", "seohui", "study"]
description: "RxAndroid RxJava 활용."
cover: "./cover4.png"
---

# **6장. 1 - RxAndroid 소개**

### **RxAndroid 소개**

#### RxAndroid

- **Observable** : 비즈니스 로직을 이용해 데이터를 발행

- **구독자** : Observable에서 발행한 데이터를 구독

- **스케줄러** : 스케줄러를 통해 Observable, 구독자가 어느 스레드에서 실행될지 결정.

  

#### **기존 안드로이드** 문제점

- 안드로이드의 비동기 처리 및 에러 핸들링
- 수많은 핸들러와 콜백 때문에 발생하는 디버깅 문제
- 2개의 비동기 처리 후 결과를 하나로 합성하는 작업
- 이벤트 중복 실행.

#### **RxAndroid 장점**

- 간단한 코드로 복잡한 병행 프로그래밍이 가능
- **비동기 구조에서 에러를 쉽게 다룸**
- 함수형 프로그래밍 기법도 부분적 적용 가능



#### **RxLifecycle 라이브러리**

안드로이드와 UI 라이프 사이클을 대체한다기보다 구독할 때 발생할 수 있는 **메모리 누수를 방지하기 위해 사용**한다.

**완료하지 못한 구독을 자동으로 해제**(dispose)한다.



```
public class RxAndroidSample extends RxAppCompatActivity {

	...	
    
	private Unbinder mUnbinder;

	@Override
	void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		mUnbinder = ButterKnife.bind(this);
        
		Observable.just("RxAndroid").compose(bindToLifeCycle()).subscribe(Log::i);
	}


	@Override
	void onDestroy() {
		super.onDestroy();
		if (mUnbinder != null) {
			mUnbinder.unbind();
		}
	}
}
```

보통 사용하는 **AppCompatActivity 클래스 대신 RxAppCompatActivity 클래스를 상속**하도록 소스코드를 수정해야 한다.

또한, Observable 생성 부분에 **compose()를 사용하여 라이프 사이클을 관리**한다.

Observable은 RxAndroidSample 클래스가 종료되면 자동으로 해제(dispose)가 된다.

해당 내용은 메모리 누수와 관련이 높으므로 마지막장에 가서 추가적으로 살펴보겠습니다.

 

### **UI 이벤트 처리**

View 클래스 안에는 UI 이벤트를 처리하기 위한 몇 가지 콜백 메서드가 존재. 이벤트리스너라고 하는 인터페이스 모음.

#### **이벤트 리스너**

이벤트 리스너는 콜백 메서드 하나를 포함하는 뷰 클래스 안의 인터페이스.

onClick(), onLongClick(), onFocusChange(), onKey(), onTouch(), onCreateContextMenu() 가 존재한다.

책의 예제는 이 중 onClick() 메서드에 Observable 을 활용한 예제를 다루고 있습니다. 



**예제 확인

코드 6-8 => 코드 6-9, 6-10

8: subscribe() 의 함수 인자로 View 객체를 전달

10. RxView사용하여 명시적인 옵저버블 생성 필요없이 클릭 리스너 설정도 내부에서 자동처리되어 코드가 직관적이고 가독성도 향상. 



 \* **액티비티 중복 실행 문제 해결 방법**

빠른 시간 안에 액티비티의 실행을 다시 요청하면, **singleTop의 경우에도 액티비티는 중복 실행** 된다. 이 때, **debounce() 함수를 사용하면 쉽게 문제를 해결**할 수 있다.



```
...

@Override
public void onActivityCreate(Bundle savedInstanceState) {
	super.onActivityCreate(savedInstanceState);
    
	mDisposable = getObservable()
	.debounce(1000, TimeUnit.MILLISECONDS)
	.observeOn(AndroidSchedulers.mainThread())
	.subcribe(s -> ... );
    
    ...
}   
```

 

debounce 함수는 빠르게 연속 이벤트를 처리하는 흐름 제어 함수이다.

계산 스케줄러에서 동작하며, 어떤 이벤트가 입력되고 timeout에서 지정한 시간동안 추가 이벤트가 발생하지 않으면 마지막 이벤트를 최종적으로 발행한다.

즉, **지정한 시간동안 발생한 이벤트 중 마지막 이벤트를 발행**하는 방식이다.

 

따라서, 액티비티를 빠르게 여러번 요청할 경우에도 지정한 시간동안 발생한 이벤트 중 마지막 이벤트만 발행하므로 중복 실행 문제를 해결할 수 있다.

 

*실습예제 - 예제 p216

**안드로이드에서 UI 업데이트는 UI 스레드에서만 가능하다.**

즉, **.observeOn(AndroidSchedulers.mainThread()) 를 사용**하여 구독자의 스레드가 **메인(UI) 스레드임을 명시**해준다.

이 부분을 **생략하면 WrongThreadException 이 발생**한다.





# 6.2 - RecyclerView 클래스



#### **RecyclerView 클래스**

- **리스트 뷰(ListView)의 장단점을 보완한 위젯.**
- **한정된 수의 뷰를 유지해서 매우 효율적**으로 스크롤 할 수 있는 큰 데이터 세트를 표시하기 위한 컨테이너.
- 서브 클래스인 LayoutManger를 이용하여 뷰를 정의, Adapter 클래스를 이용하여 DataSet에 맞는 ViewHolder 클래스를 구현할 수 있습니다.

#### **RecyclerView와 함께 사용하는 주요 클래스**

- **Adapter** : 데이터 세트의 **아이템을 나타내는 뷰**를 생성
- **ViewHolder** : **재활용 뷰**에 대한 모든 **서브 뷰를 저장**
- **LayoutManager** : 뷰에 있는 **아이템을 배치하고 관리**
- **ItemDecoration** : 아이템을 **꾸미는** 서브 뷰를 제어
- **ItemAnimation** : 아이템을 추가, 정렬, 제거할 때 **애니메이션 효과**를 준다.



#### **Adapter 클래스**

**ListView는 데이터 종류에 따라 클래스를 구분**하여 사용한다.

하지만, **RecyclerView**는  **ViewHolder 클래스의 정의에 따라 UI를 선택하고 데이터를 처리**한다.

 

**필수 구현 메서드**

- **onCreateViewHolder**(ViewGroup parent, int viewType) : ViewHolder를 생성하고 뷰를 붙여준다. viewType에 따라 최초 1회만 호출된다.
- **onBindViewHolder**(ListItemViewHolder holder, int position) : 재활용하는 뷰를 호출하여 실행. 뷰 홀더를 전달하고 어댑터는 position 인자의 데이터를 결합
- **getItemCount()** : 데이터의 개수를 반환



코드 6-16 부분의  Click 이벤트를 보면 분리된 Observable에 생성합니다. 이렇게 콜백 지옥을 대체하고자 처리하는 방식입니다.

아래 내용에서는 왜 뜨거운 Observable이어야 하는지가 잘 나와있습니다. 구독자가 없더라도 실시간으로 처리되어 소비해야 하는 Click이벤트 특성 때문입니다.



```
코드 6-16

class MyViewHolder extends RecyclerView.ViewHolder {
    @BindView(R.id.item_image)
    ImageView mImage;
    @BindView(R.id.item_title)
    TextView mTitle;

    private MyViewHolder(View itemView) {
        super(itemView);
        ButterKnife.bind(this, itemView);
    }

    Observable<RecyclerItem> getClickObserver(RecyclerItem item) {
        return Observable.create(e -> itemView.setOnClickListener(view -> e.onNext(item)));
    }
```



```

@Override
    public int getItemCount() {
        return mItems.size();
    }

    public void updateItems(List<RecyclerItem> items) {
        mItems.addAll(items);
    }

    public void updateItems(RecyclerItem item) {
        mItems.add(item);
    }

    public PublishSubject<RecyclerItem> getItemPublishSubject() {
        return mPublishSubject;
    }



class RecyclerViewAdapter extends RecyclerView.Adapter<RecyclerViewAdapter.MyViewHolder> {


	...

	// DataSet 클래스의 RecyclerItem는 게시글 최하단에 구현.
	private List<RecyclerItem> mItems = new ArrayList<>();

	...

	@Override
	public MyViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
		final View view = LayoutInflater.from(parent.getContext())
			.inflate(R.layout.custom_recycler_view_item, parent, false);
			// custom_recycler_view_item 는 직접 구현 필요
        
		return new MyViewHolder(view);
	}	


	// 화면에 보여줄 데이터들을 세팅
	@Override
	public void onBindeViewHolder(MyViewHolder holder, int position) {
		final RecyclerItem item = mItems.get(position);
		holder.mImage.setImageDrawable(item.getImage());
		holder.mTitle.setText(item.getTitle());
		holder.mSize.setText(item.getSize());
		...
	}


	@Override
	public int getItemCount() {
		return mItems.size();
	}

	...

}
```

 

#### **LayoutManger 클래스**

뷰를 그리는 방법을 정의한다.

 

**LayoutManger 클래스에서 사용할 수 있는 리스트의 종류는 세 가지 이다.**

- **LinearLayoutManger** : 가로 또는 세로 형태의 리스트
- **GridLayoutManger** : 그리드 형식
- **StaggeredGridLayoutManger** : 지그재그 그리드 형식

------

```
@Data
public class RecyclerItem {
	Drawable image;
	String title;
	int size;
	...
    
아래 내용에 확인가능 getter/setter
	... getter() { ... };
	... setter(...) { ... };
    
    ...
}
```

 

**DataSet 클래스**는 다음과 같이 구현된다.

보통, DataSet 클래스는 RecyclerView를 사용하여 **화면에 뿌려줄 데이터들을 가지고 있는 클래스**로,

getter, setter을 사용해 데이터를 get, set 하는 함수를 구현한다.

 

*** LomBok 라이브러리와 @Data 애너테이션을 사용하면 getter, setter, equals 메서드 및 생성자를 자동으로 생성해준다.**





# 6. **3 - Thread**

**안드로이드는 기본적으로 싱글 스레드 모델.**

따라서 **처리하는 데 오래 걸리는 작업의 경우 별도 스레드로 분리하여 작업**해야 한다.



### **뷰와 뷰 그룹의 스레드 관리**

- 안드로이드의 뷰나 뷰 그룹은 **UI 스레드(메인 스레드)에서만 업데이트**할 수 있게 되어있다.
- 여러 스레드에서 동시에 UI를 업데이트할 때 발생할 수 있는 **동기화 문제를 예방하기 위함**.
- **Looper와 Handler 클래스**를 통해 일반 스레드에서 작업한 결과를 **뷰에 업데이트** 할 수 있다.

*****

**Looper와 Handler 클래스를 사용한 UI스레드 업데이트.**

1. Handler 객체가 스레드를 생성.
2. 스레드는 Handler를 이용해 Message를 Messgae Queue에 넣음.
3. UI스레드는 Looper 클래스를 이용해 Message Queue에 접근.
4. Message를 꺼내어 UI스레드에서 사용.

#### **AsyncTask 클래스**

안드로이드에서 제공하는 추상 클래스로 안드로이드에서 사용하는 **대표적인 스레드** 중 하나.

별도의 Handler 클래스나 스레드 사용 없이 **UI 스레드에서 백그라운드 작업을 수행하겨 결과를 바로 뷰 화면에 업데이트** 할 수 있다.

 코드 6-20

```
...

MyAsyncTask.execute("RxStudy", "Test");

public class MyAsyncTask extends AsyncTasK<String, Void, String> {
	@Override
	String doInBackgorund(String... params) {

		...

	}
    
    
	@Override
	void onPostExecute(String result) {
    
		...

	}
}
```

 

**execute 메서드**를 호출하면, MyAsyncTask 클래스의 **doInBackground()를 호출**하여 execute 메서드의 인자들을 전달한다.

onPostExecute()을 통해 doInBackground 마지막에 return된 결과를 사용하여 화면을 갱신하는 등 작업을 수행할 수 있다.

 

*****

**AsyncTask 클래스는** UI 스레드가 아닌 **싱글 워커 스레드에서 동작**하며, doInBackground 내부에서 publishProgress() 를 이용하여 실행 중간중간에 화면을 바로 갱신할 수 있다.

#### **AsyncTask 단점**

1. 오직 한 번만 실행되며, **재사용이 불가능**하다.
2. 액티비티 종료를 명시해야만 종료되므로 **메모리 누수 발생의 위험**이 있다.
3. AsyncTask 클래스는 **항상 UI 스레드 위에서 불러와야 한다.**

 

#### **RxAndroid를 이용하여 TimerTask 대체하기.**

Timer 클래스나 Handler 클래스를 이용하여 **주기적으로 실행하는 동작을 구현**한다.

Timer 클래스는 schedule() 메서드를 이용하여 지연 시간을 설정하거나 특정 시간에 동작, 반복 실행을 구현할 수 있다.

Handler 클래스는 postDelayed() 메서드를 이용하여 지연 시간 설정이나 반복 실행을 구현할 수 있다.

 

따라서, RxAndroid에서 반복 실행에 사용되는

1. **interval() 함수**
2. **repeatWhen() 과 delay() 함수**

**를 사용해 대체가 가능**하다.

 

 

*****

RxAndroid에서 **추가되는 스케줄러 함수는 두가지**다.

- **mainThread()** : 스케줄러 내부에서 직접 MainLooper에 바인딩 한다.
- **from()** : 개발자가 임의의 Looper 객체를 설정할 수 있다.

**AndroidSchedulers.mainThread()**는 **AndroidSchedulers.form(Looper.getMainLooper())와 동일**하다.

 

*****

**스레드 사이에서 통신하기 위해서는 Handler 클래스가 필요.**

RxAndroid에서도 Handler 클래스를 이용하여 스레드와 통신하며, **UI 스레드와 통신을 위해 MainLooper를 이용하여 스레드 안에 Handler를 생성** - 결과 그림 10

 

 +REST 는 '네트워크 아키텍처 원리'의 모음으로 자원을 정리하고 자원에 대한 주소를 지정하는 방법 전반을 말한다.

이러한 사양에 따라 구현된 서비스를 RESTful 웹서비스라고 한다.

### **Volley 라이브러리**

구글 IO 2013에서 공개한 안드로이드용 라이브러리.
다른 안드로이드 용 HTTP 클라이언트 라이브러리가 제공하는 기능을 제공하면서도

**용량이 작고 빠른 실행속도가 장점.**

 

#### **Volley 사용 방법**

1. RequestQueue 생성
2. Request Object 생성
3. Request Object를 RequsetQueue에 추가
4. 설정한 Callback으로 응답 수신

*****

Observable 에서 제공하는 비동기 함수인 **defer, fromCallable, fromFuture 함수**를 사용하여 Volley의 **RequestFuture 객체를 처리**한다.

[질문]

Q. p.245 

어떻게 싱글턴과 동일한 효과인지? 
A. 코드 27,28 



```
코드 27
public class LocalVolley {

    private static RequestQueue sRequestQueue;

    private LocalVolley() { }

    public static void init(Context context) {
        sRequestQueue = Volley.newRequestQueue(context);
    }

    public static RequestQueue getRequestQueue() {
        if (sRequestQueue != null) {
            return sRequestQueue;
        } else {
            throw new IllegalStateException("Not inited");
        }
    }
}
```



```
코드 28
public class RxAndroid extends Application {
    @Override
    public void onCreate() {
        super.onCreate();

        LocalVolley.init(getApplicationContext());
    }
}

```



### LocalVolley

**Context**를 이용하여 RequestQueue를 생성

Context를 가지고 있다
 → RequestQueue를 생성하여 싱글턴과 동일한 효과를 제공 (Application을 상속하고 있는 class에서 init하여 초기화, onCreate() 한번만 실행 
→ 애플리케이션이 생성되는 시점에서 큐 생성)
 —> singleton 효과

### RequestObject

Future객체로 대체 함으로써 콜백 지옥을 벗어날 수 있음

Future은 비동기 계산 결과를 얻는 객체

<코드 6-30>

```
// lambda expression 비동기 객체니까!
private Observable<JSONObject> getObservable() {
    return Observable.defer(() -> {
        try {
            return Observable.just(getData());
        } catch (InterruptedException e) {
            log("error : " + e.getMessage());
            return Observable.error(e);
        } catch (ExecutionException e) {
            log("error : " + e.getCause());
            return Observable.error(e.getCause());
        }
    });
}

```



## Retrofit2 + OkHttp

### OkHttp

- SPDY/GZIP 지원 등 네트워킹 스택을 효율적으로 관리할 수 있고, 빠른 응답 속도를 보일 수 있다는 장점

### Retrofit

- 서버 연동과 응답 전체를 관리하는 라이브러리 (연동 뿐만 아니라 응답까지 관리해줘서 okHttp랑 다름)
- 2.x이상의 버전에서는 OkHttp에 의존하고 있음

1. Retrofit.Builder 객체 생성
2. baseUrl() + addConverterFactory() → JSON 변환기 설정
3. retrofit.create()호출로 단일 인터페이스 프락시 생성

**getSimpleApi() vs getServiceApi()**

REST API 스택의 디버깅 가능 여부

- getSimpleApi() : OkHttpClient 클래스 사용
- getServiceApi() : OkHttpClient.Builder() 객체를 구성하여 로그에 대한 intercepter 설정

<코드 6-35 &. 6-36 ! rx적으로>



```

public class Contributor {
    String login;
    String url;
    int id;

    @Override
    public String toString() {
        return "login : " + login + "id : " + id + "url : " + url;
    }
}

```



```

34
public class RestfulAdapter {

    private static final String BASE_URI = "https://api.github.com/";

    private RestfulAdapter() { }
    private static class Singleton {
        private static final RestfulAdapter instance = new RestfulAdapter();
    }

    public static RestfulAdapter getInstance() {
        return Singleton.instance;
    }

    public GitHubServiceApi getServiceApi() {

        HttpLoggingInterceptor logInterceptor = new HttpLoggingInterceptor();
        logInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);

        OkHttpClient client = new OkHttpClient.Builder().addInterceptor(logInterceptor).build();

        Retrofit retrofit = new Retrofit.Builder()
                .addCallAdapterFactory(RxJava2CallAdapterFactory.create())
                .addConverterFactory(GsonConverterFactory.create())
                .client(client)
                .baseUrl(BASE_URI)
                .build();

        return retrofit.create(GitHubServiceApi.class);
    }
```



```

/**
 * retrofit + okHttp( Call의 내부 )
 */
private void startRetrofit() {
    GitHubServiceApi service = RestfulAdapter.getInstance().getSimpleApi();
    Call<List<Contributor>> call = service.getCallContributors(sName, sRepo);
    call.enqueue(new Callback<List<Contributor>>() {
        @Override
        public void onResponse(Call<List<Contributor>> call, Response<List<Contributor>> response) {
            if (response.isSuccessful()) {
                List<Contributor> contributors = response.body();
                for (Contributor c : contributors) {
                    log(c.toString());
                }
            } else {
                log("not successful");
            }
        }

        @Override
        public void onFailure(Call<List<Contributor>> call, Throwable t) {
            log(t.getMessage());
        }
    });
}

```



```

/**
 * retrofit + okHttp
 */
private void startOkHttp() {
    GitHubServiceApi service = RestfulAdapter.getInstance().getServiceApi();
    Call<List<Contributor>> call = service.getCallContributors(sName, sRepo);

    call.enqueue(new Callback<List<Contributor>>() {
        @Override
        public void onResponse(Call<List<Contributor>> call, Response<List<Contributor>> response) {
            if (response.isSuccessful()) {
                List<Contributor> contributors = response.body();
                for (Contributor c : contributors) {
                    log(c.toString());
                }
            } else {
                log("not successful");
            }
        }

        @Override
        public void onFailure(Call<List<Contributor>> call, Throwable t) {
            log(t.getMessage());
        }
    });
}
```

```

/**
 * retrofit + okHttp + rxJava
 */
private void startRx() {
    GitHubServiceApi service = RestfulAdapter.getInstance().getServiceApi();
    Observable<List<Contributor>> observable = service.getObContributors(sName, sRepo);

    mCompositeDisposable.add(observable.subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribeWith(new DisposableObserver<List<Contributor>>() {
                @Override
                public void onNext(List<Contributor> contributors) {
                    for (Contributor c : contributors) {
                        log(c.toString());
                    }
                }

                @Override
                public void onError(Throwable e) {
                    log(e.getMessage());
                }

                @Override
                public void onComplete() {
                    log("complete");
                }
            })


    );
}
```

6-36

1. API Proxy를 생성
2. Observable을 이용하여 값을 전달함
3. Observable을 활용하여 데이터 받아서 action 수행

> Observable : 명령 수 만큼 호출하고 flatMap을 통해 합침 투퉁탁

> CompletableFuture : Future 객체로 생성하고 allOf()를 통해 모든 명령을 비동기로 요청. 결과는 Stream.of()로 묶어서 처리 가능



# **6. 4 - 메모리 누수**



### **메모리 누수**

**메모리 누수(Memory Leak)**란 보통 참조가 완료되었지만 **할당한 메모리를 해제하지 않았을 때 발생**.

특히, **강한 참조의 경우 가비지 컬렉터가 메모리에서 객체를 제거할 수 없으므로** 라이프 사이클에 맞게 객체 참조를 끊어주어야 메모리 해제가 가능하다.

메모리 누수는 **시스템 전체 성능에 영향**을 미친다.

 

*****

**Observable**은 안드로이드의 컨텍스트(Context)를 복사하여 유지한다.

onComplete(), onError() 함수가 호출되면 **내부에서 자동으로 unsubscribe() 함수를 호출하여 메모리를 해제**해준다.

 

하지만, **액티비티가 비정상적으로 종료**되면 액티비티가 종료되어도 **가비지 컬렉션의 대상이 되지 못하는 경우가 발생**할 수 있으며, 이 때 **메모리 누수가 발생**하게 된다.

 

### **메모리 누수 해결방안**

### 1.**Disposable 인터페이스를 이용한 명시적 자원 해제**

- **onCreate()** 에서 subscribe()를 호출하면 **onDestory()** 에서 메모리 참조를 해제.
- **onResume()**에서 subscribe()를 호출하면 **onPause()** 에서 메모리 참조를 해제.

### 2.**RxLifecycle 라이브러리 이용**

액티비티의 부모를 **RxAppCompatActivity로 변경**하고 **compose() 함수를 사용**하여 RxLifecycle 라이브러리를 적용.

 

```
public class SampleRxLifecycle extends RxAppCompatActivity {

	prvate Unbinder mUnbinder;
	...
    

	Observable.create(~)
		//.compose(bindToLifecycle())
		.compose(bindUntilEvent(ActivityEvent.DESTROY))
		.subscribe(~);

	...
    
    
	@Override
	public void onDestroy() {
		super.onDestroy();

		if (mUnbinder != null) {
			mUnbinder.unbind();
		}
    
	}
    
	...
    
}
```

 

compose(bindToLifecycle()) 함수를 사용하게 되면, **onCreate - onDestroy, onResume - onPause 메서드가 쌍으로 동작**한다. 즉, onCreate에서 subscribe를 호출하면 onDestroy에서 unsubscribe를 호출한다.

 

**bindUntilEvent 함수를 선언하면 종료되는 시점을 직접 설정**할 수 있다.

ActivityEvent를 활용해 종료되는 시점을 선택할 수 있다.

 

```
public enum ActivityEvent {
	CREATE,
	START,
	RESUME,
	PAUSE,
	STOP,
	DESTROY
}
```

 

### 3.**CompositeDisposable 클래스 이용**

CompositeDisposable 클래스를 이용하면 생성된 **모든 Observable을 안드로이드 라이프 사이클에 맞춰 한번에 모두 해제**할 수 있다.

 

사용하는 방법은, 첫 번째 해결책의 연장선이다.

**첫 번째 해결책**은 DisposableObserver 객체를 **직접 해지**하는 반면,

이 방법은 Publisher.subscribe() 를 이용하여 Disposable을 리턴한 후 **CompositeDisposable** **클래스에서 일괄적으로 처리하는 방식**이다.

 

**Publisher.subscribe()는 return 값이 void 이므로, subscribeWith() 함수를 사용하거나 인자에 소비자(Consumer)를 전달해 Disposable 객체를 리턴받아야 한다.**



clear() 와 dispose() 함수 모두 등록된 Disposable 객체를 삭제한다는 점은 같다. 그러나 clear() 함수의 경우 계속   Disposable 객체를 받을 수 있지만, dispose() 함수의 경우  isDisposable() 함수를 true로 설정하여 새로운 Disaposable 객체를 받을 수 없다.

```
#### reference
https://heegs.tistory.com/20?category=784135
---

Rxjava 프로그래밍 
https://aroundck.tistory.com/6227
https://github.com/yudong80/reactivejava/tree/master/chapter06/rxAndroid
Rxjava 프로그래밍
(https://github.com/yudong80/reactivejava/tree/master/chapter06/rxAndroid)


```

