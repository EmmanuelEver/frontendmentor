<script>
    import FeatureCard from "./FeatureCard.svelte"
    import FeatureList from "./FeatureList.svelte"
    let features = [
        {src: "./images/illustration-grow-together.svg", title: "Grow Together", body: " Generate meaningful discussions with your audience and build a strong, loyal community. Think of the insightful conversations you miss out on with a feedback form.", id:1},
        {reverse: true, src: "./images/illustration-flowing-conversation.svg", title: "Flowing Conversations ", body: "You wouldn't paginate a conversation in real life, so why do it online? Our threads have just-in-time loading for a more natural flow.", id:2},
        {src: "./images/illustration-your-users.svg", title: "Your Users", body: "It takes no time at all to integrate Huddle with your app's authentication solution. This means, once signed in to your app, your users can start chatting immediately.", id:3}
    ]
</script>

<section class="w-full bg-white relative">
    <div class="max-w-screen-2xl pt-12 mx-auto px-6 pb-40 md:pt-20 md:px-24 xl:px-44 xl:pb-52 xl:pt-28">
        <FeatureList>
            {#each features as feature (feature.id)}
                <FeatureCard 
                    title={feature.title} 
                    body={feature.body}
                    src={feature.src}
                    alt={feature.alt}
                    reverse={feature.reverse}
                />
            {/each}
        </FeatureList>
    </div>
    <div class="bg-white w-11/12   max-w-screen-sm  absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2  px-7 py-10 -mb-1/2 shadow-lg rounded-2xl">
        <h2 class="font-secondary  text-xl text-secondary-200 text-center font-bold"> Ready To Build Your Community?</h2>
        <a href="/" class="mt-8 bg-primary shadow-md font-secondary font-bold text-white text-center leading-none px-12 py-5 rounded-full block hover:opacity-80 max-w-xs mx-auto">
            Get Started For Free
          </a>
    </div>
</section>