---
title: How do Kotlin coroutines work internally
date: "2021-09-01"
tags: ["mash-up", "Coroutine","dahyun"]
description: "코루틴의 내부적인 작동을 살펴봅니다."
cover: "./images/thumbnail.png"
---

안녕하세요 안드로이드 11기 강다현입니다.

# Coroutine under the hood

이번엔 코루틴의 내부 동작에 대해 살펴보도록 합시다.

이 내부 동작에서의 핵심 키워드는 **Continuation** (Continuation-Passing-Style)입니다.

우리가 코루틴을 사용할 때, 기본적으로 suspend function은 함수를 중간에 멈출수가 있습니다. 

그러나 suspend function을 사용하다 보면 이런 의문이 생깁니다.

**다시 멈추고 다시 돌아갈 땐 (resume) 내부적으로 어떻게 동작하는 걸까요?**

**어떤 포인트에서 다시 시작해야할지 어떻게 알까요? (일종의 마법같은? 현상!)**

이 문제를 해결하기 위한 개념이 바로 **Continuation-Passing-Style**. [**CPS**](https://en.wikipedia.org/wiki/Continuation-passing_style)입니다.

먼저 간단한 예시를 보고 CPS를 이해해볼까요? 

`requestToken()`, `createPost(token, item)`는 시간이 조금 걸리는 함수라고 생각해봅시다.

먼저 그냥 일반적인 콜백 함수 형태입니다. 지저분합니다!

```kotlin
fun postItem(item: Item) { 
	requestToken { token ->
		createPost(token, item) { post ->
			processPost(post) 
		}
	}
}
```

이제 코루틴에서의 suspend function을 볼까요?

```kotlin
suspend fun postItem(item: Item) { 
	val token = requestToken() 
	val post = createPost(token, item) 
	processPost(post) 
}
```

위의 코드는 일명 Direct Style이라고 할 수 있습니다. 실제로 우리는 이런 식으로 작성을 해도 되는 것이죠. (물론 여기서는 requestToken, createPost도 suspend로 바뀐 상태입니다) 왜 그럴까요? 위 코드가 CPS가 되도록 아래 코드처럼 내부적으로 바뀌기 때문입니다! (컴파일러 단에서 바뀐다고 생각하면 됩니다.)

물론 이 함수는 작기 때문에 이정도이지만, 실제로 구현된 코드는 보다 복잡할 것입니다.

(suspend function을 IDE의 Tool -> Kotlin -> Show Kotlin Bytecode -> Decompile을 통해 자바코드를 직접 확인해 볼 수도 있습니다! 물론 이 경우는 훨씬 복잡하게 보이겠지만, label 정도는 분별해볼 수 있습니다.)

```kotlin
fun postItem(item: Item, cont: Continuation) { 
	val sm = object : CoroutineImpl { ... } 
	switch (sm.label) { 
		case 0: requestToken(sm) 
		case 1: createPost(token, item, sm) 
		case 2: processPost(post) 
	} 
}
```

아하? label을 통해 보다 확 와닿는것 같습니다!

**Continuation**이라는 **매개변수**가 **추가**되었고, **label**에 따라 다른 행동을 한다는 것을 알 수 있죠.

조금 더 와닿는 코드를 볼까요?

```kotlin
fun postItem(item: Item, cont: Continuation) { 
	val sm = object : CoroutineImpl { 
		fun resume(...) {
			postItem(null,this) // 2
		}
	 } 
	switch (sm.label) { 
		case 0: 
			sm.item = item
			sm.label = 1 
			requestToken(sm) // 1
		case 1: 
			val item = item
			val token = sm.result as Token
			createPost(token, item, sm) // 3
		case 2: 
			processPost(post) 
	} 
}
```

case 0에서 requestToken이 끝나고 (1) sm은 resume를 하게 될 것입니다. (2) 

그럼 다시 cont의 label이 바뀐 채로 넘어가서 다음 case로 가는 것이죠! (3)

이런 식으로 계속 진행되는 것입니다!

즉, CPS는 컨트롤을 Continuation의 형태로 전달되는 프로그래밍 스타일입니다. 그리고 CPS는 곧, 콜백의 한 형태라고도 볼 수 있을 것입니다. **CPS == Callback**

# 좀 더 명확하게 개념을 정리해봅시다!

CPS를 사용하면 어떤 일을 수행하기 위한 일련의 함수들의 연결을 각 함수의 반환값을 이용하지 않고 Continuation 이라는 추가 파라미터(Callback)를 두어 연결하는 방식으로 사용할 수 있습니다.

이렇게 되면 Continuation 단위로 하여금 dispatcher를 변경한다거나 실행을 유예한다거나 하는 일종의 플로우 컨트롤이 용이해지는 이점이 있게 됩니다! 우리가 앞서 생각했던 마법같은 일이 가능해지는 것이죠.

이런 방식은 **State Machine** 방식으로 구현된다고 볼 수도 있습니다. (위의 sm이 State Machine 입니다.)

# 간접적으로 구현해보자면?

내부적으로 동작하는 방식을 알았으니, 이해도를 높이기 위해서 이러한 방식의 코딩을 간접적으로 구현해보겠습니다.

앞서 사용했던 예시를 바꿔보죠!

```kotlin
class ExampleContinuation(override val context: CoroutineContext = EmptyCoroutineContext) : Continuation<String> {

    var label = 0
    var result = ""

    override fun resumeWith(result: Result<String>) {
        this.result = result.getOrDefault("Default")
        postItem(null, this)
    }
}

fun main() {
    postItem("item", ExampleContinuation())
}

fun postItem(item: String?, cont: ExampleContinuation) {
    when (cont.label) {
        0 -> {
            cont.label = 1
            requestToken(item!!, cont)
        }
        1 -> {
            cont.label = 2
            createPost(cont.result, cont)
        }
        2 -> {
            processPost(cont.result, cont).run { println(this) }
        }
    }
}

fun requestToken(item: String, cont: Continuation<String>) {
    val result = "requestToken + $item"
    cont.resumeWith(Result.success(result))
}

fun createPost(token: String, cont: Continuation<String>) {
    val result = "createPost + $token"
    cont.resumeWith(Result.success(result))
}

fun processPost(post: String, cont: Continuation<String>): String {
    val result = "processPost + $post"
    return result
}
```

임의의 Continuation을 만들어주었고, 모든 result는 String으로 이해하기 쉽게 만들었습니다.

이 코드의 결과는 예상하다시피 다음과 같은 값이 print 될 것입니다.

**processPost + createPost + requestToken + item**

결론적으로 suspend란 키워드로 인해 이런 형태로 바뀐다! 라는 사실을 알면 좋을 것 같습니다.

추가적으로 원래는 Continuation이 제네릭으로 되어있다는 사실도 알아두면 좋겠습니다.

```kotlin
public interface Continuation<in T> {
    /**
     * The context of the coroutine that corresponds to this continuation.
     */
    public val context: CoroutineContext

    /**
     * Resumes the execution of the corresponding coroutine passing a successful or failed [result] as the
     * return value of the last suspension point.
     */
    public fun resumeWith(result: Result<T>)
}
```

# 결론

코루틴의 내부 동작은 더 엄밀히 따지자면 조금 더 복잡한 로직이 있겠지만, 기본적인 틀은 이렇게 CPS를 사용하고 있다고 할 수 있습니다.

사실 이 부분은 모르더라도 사용하는 데 지장은 없을 것입니다. 하지만 이런 로직을 알고 쓰면 코루틴을 더 잘 활용할 수 있지 않을까? 싶습니다. 더 높은 수준의 프로그래밍을 바라본다면 이런 내용도 알면 좋을 것이라 생각합니다!

혹시 잘못된 부분이 있다면 언제든지 지적 부탁드립니다.

## Reference

(https://en.wikipedia.org/wiki/Continuation-passing_style)

(https://myungpyo.medium.com/reading-coroutine-official-guide-thoroughly-part-1-dive-2-31491e54a762)

(https://june0122.github.io/2021/06/09/coroutines-under-the-hood/)

(https://www.youtube.com/watch?v=YrrUCSi72E8)