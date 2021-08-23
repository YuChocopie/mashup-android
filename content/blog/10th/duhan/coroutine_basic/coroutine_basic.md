---

title: "Coroutine Basic"

date: "2021-01-15"

tags: ["coroutine-study", "1주차 스터디", "coroutine-basic"]

description: "1주차 코루틴 스터디 : Coroutine Basic"

cover: "./coroutine_basic.png"

---

# 1. Coroutine Basic

안녕하세요. 1주차 코루틴 스터디에서 진행했던 내용을 공유하고자 포스팅 해봅니다.

### 코루틴
- 코루틴은 경량 스레드라고도 불린다.
- 코루틴은 스레드안에서 실행된다.
- 스레드 하나에 많은 코루틴이 있을 수 있다.
- 스레드와 코루틴의 가장 큰 차이점은 코루틴은 빠르고 적은 비용으로 생성할 수 있다는 것이다.  
**→ 즉, 코루틴은 기본적으로 스레드안에 존재하지만, 스레드에 얽메이지 않은 가벼운 스레드이다.**

### 얼마나 가벼운가?
코루틴 생성함수를 만들어 소요시간을 계산해 얼마나 빠르게 생성되는지 테스트를 해보았습니다.
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
	super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    runBlocking {
        val time = measureTimeMillis {
            createCoroutines(100)
        }
        Log.d(TAG, "소요시간 : ${time}ms")
    }
}

private suspend fun createCoroutines(amount: Int){
	val jobs = ArrayList<Job>()
		for(i in 1..amount){
			jobs += GlobalScope.launch{
				delay(1000)
			}
		}
	jobs.forEach{
		it.join()
	}
}
```  
- onCreate에서 코루틴을 생성하고 각 코루틴들은 1초의 딜레이만 가지며 완료됩니다.
- createCoroutine 전 후 소요시간을 비교합니다.

실행결과  
`1. 코루틴 100개 생성 → 소요시간 : 1094ms`  
`2. 코루틴 10,000개 생성 → 소요시간 : 1669ms`  
**→ 코루틴 100개 생성시 코루틴 생성 후 딜레이을 요청한 1초를 제외하면 소요시간이 거의 걸리지 않았고, 10,000개의 코루틴을 생성 요청하여도 약 0.7초의 시간만이 소요된걸 확인 할 수 있었습니다. 만약에 생성한게 코루틴이 아닌 스레드였다면 ANR이 발생하여 소요시간 측정이 불가능 했을겁니다.**

### 스레드에 얽메이지 않는 코루틴
코루틴은 특정 한 스레드에 종속되지 않습니다. 즉, suspend 되었다가 resume 될 때 다른 스레드로 적재될 수 있는데요. 이를 확인하기 위해 아래와 같은 코드를 실행해 보았습니다.
```kotlin
private suspend fun createCoroutines(amount: Int){
	val jobs = ArrayList<Job>()
	for(i in 1..amount){
		jobs += GlobalScope.launch{
			Log.d(TAG, "$i is started in ${Thread.currentThread().name}")
			delay(1000)
			Log.d(TAG, "$i is finished in ${Thread.currentThread().name}")
		}
	}
	jobs.forEach{
	it.join()
	}
}
```

실행결과
```kotlin
1 is started in DefaultDispatcher-worker-1
2 is started in DefaultDispatcher-worker-2
3 is started in DefaultDispatcher-worker-3
2 is finished in DefaultDispatcher-worker-1
1 is finished in DefaultDispatcher-worker-3
3 is finished in DefaultDispatcher-worker-1
```
이처럼 suspend 함수인 delay() 동작 후 다른 스레드에서 동작함을 확인 할 수 있었습니다.

### runBlocking() 함수에 대해
위에 예시코드에서 사용한 runBlocking()은 실제 동작하는 코루틴을 작성할 때는 사용하면 안되는 함수입니다. runBlocking() 함수의 주석을 살펴보겠습니다.
```kotlin
/**
* This function should not be used from a coroutine. It is designed to bridge regular blocking code
* to libraries that are written in suspending style, to be used in `main` functions and in tests.
**/
```
→ **코루틴에서 사용해서는 안되고, 'main' 함수와 테스트에 사용하도록 설계되었습니다.**  
안드로이드의경우 runBlocking() 함수를 메인스레드에서 호출하여 시간이 오래걸리는 작업을 수행하는 경우 ANR이 발생할 위험이 있습니다. 코루틴의 장점은 일시중단 기능을 이용하여 하나의 스레드가 여러가지 작업을 효율적으로 처리 할 수 있다는 점인데, runBlocking()함수로 만들어진 블록은 일시중단이 아닌 차단이라 코루팀의 장점이 사라집니다.  
**따라서, 코루틴에서 runBloc즉king() 함수 대신 coroutineScope()나 withContext() 함수를 사용해야 합니다.**  
본 포스팅에선 coroutineScope()와 withContext()를 아직 학습하지 않았다고 가정하고 runBlocking() 함수를 사용하였습니다.

### Job 기다리기
job은 launch와 async 빌더로 생성이 가능합니다. 두 빌더의 차이는 **값을 받아야 할땐 async, 값을 받지 않아도 될 때는 launch**를 사용한다는 점입니다.  
job에서 사용할 수 있는 함수 3가지를 소개하겠습니다.
1. join() : job이 완료  될 때까지 코루틴을 일시 중단합니다.
2. start() : job이 아직 시작되지 않은 경우 job과 관련된 코루틴을 시작하고 boolean값을 반환 합니다.
→ true : 아직 시작되지 않은 경우
→ false : 시작 되었거나 완료된 경우
3. await() : async 빌더로 생성된 job에서만 사용 가능하며, **스레드를 차단하지 않고 이 값이 완료 될 때 까지 기다렸다가 지연된 계산이 완료되면 다시 시작합니다.** 결과 값을 반환하거나 지연이 취소된 경우 해당 예외를 throw합니다.

### 구조화된 동시성
runBlocking을 포함한 모든 코루틴 빌더는 코드 블럭 범위에 CoroutineScope 인스턴스가 추가 되어 있습니다.
따라서 아래와 같은 수정이 가능합니다.
```kotlin
runBlocking{
	val job = GlobalScope.launch {
		delay(1000)
	}
	job.join()
}
```

수정 후  
```kotlin
runBlocking{
	launch {
		delay(1000)
	}
}
```
**→ 해당 범위에서 시작된 모든 코루틴이 완료 될 때까지 완료되지 않으므로 join()을 명시할 필요가 없어집니다.**

스코프 관련한 문제와 함께 포스팅 마무리 하도록 하겠습니다.  
```kotlin
fun scopeTest() = runBlocking {
	launch {
		delay(2000)
		println("1")
	}

	println("2")

	coroutineScope {
		launch {
			delay(3000)
			println("3")
		}
		delay(1000)
		println("4")
	}
		
	println("5")
}
```

- 정답  
    ```kotlin
    2
    4
    1
    3
    5
    ```

### References

[https://wishjinit.tistory.com/11](https://wishjinit.tistory.com/11)

코틀린 동시성 프로그래밍