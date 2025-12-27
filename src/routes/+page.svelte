<script lang="ts">
	const skills = [
		{ category: 'Frontend', items: ['Svelte', 'React', 'TypeScript', 'Tailwind CSS'] },
		{ category: 'Backend', items: ['Node.js', 'Python', 'PostgreSQL'] },
		{ category: 'DevOps', items: ['Docker', 'AWS', 'CI/CD', 'Linux'] }
	];

	const projects = [
		{
			title: 'This Website',
			description: 'My personal website made using SvelteKit, TailwindCSS, and and a lot of love.',
			tech: ['SvelteKit', 'TailwindCSS'],
            demo: 'gamerwaves.hackclub.app',
            repo: 'https://github.com/gamerwaves/website'
		}
	];

	let formData = {
		name: '',
		email: '',
		message: ''
	};

	let formStatus: 'idle' | 'sending' | 'success' | 'error' = 'idle';
	let statusMessage = '';
	let copyrightClicks = 0;



	async function handleSubmit(e: Event) {
		e.preventDefault();
		formStatus = 'sending';

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				formStatus = 'success';
				statusMessage = "Message sent successfully! I'll get back to you soon.";
				formData = { name: '', email: '', message: '' };
			} else {
				formStatus = 'error';
				statusMessage = 'Failed to send message. Please try again or email me directly.';
			}
		} catch (error) {
			formStatus = 'error';
			statusMessage = 'Failed to send message. Please try again or email me directly.';
		}

		setTimeout(() => {
			formStatus = 'idle';
			statusMessage = '';
		}, 5000);
	}
</script>

<div class="min-h-screen p-4 md:p-8">
	<!-- Header Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
		<!-- Name -->
		<div class="lg:col-span-3 border-box p-4 md:p-6 flex items-center justify-center">
			<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-primary text-center">Dwait Pandhi</h1>
		</div>

		<!-- Navigation -->
		<div class="lg:col-span-6 border-box p-4 md:p-6 flex items-center justify-center gap-4 md:gap-8 flex-wrap">
			<a href="#about" class="link-hover">Home</a>
			<a href="/blog" class="link-hover">Blog</a>
			<a href="#skills" class="link-hover">Skills</a>
			<a href="#projects" class="link-hover">Projects</a>
			<a href="#contact" class="link-hover">Contact</a>
		</div>

		<!-- Socials -->
		<div class="lg:col-span-3 border-box p-4 md:p-6 flex items-center justify-center gap-4">
			<div class="w-8 h-8 rounded-full flex items-center justify-center">
				<a href="https://github.com/gamerwaves" title="Github"
					><span class="text-[#47ccfc] text-xl"
						><svg
							fill-rule="evenodd"
							clip-rule="evenodd"
							stroke-linejoin="round"
							stroke-miterlimit="1.414"
							xmlns="http://www.w3.org/2000/svg"
							aria-label="github"
							viewBox="0 0 32 32"
							preserveAspectRatio="xMidYMid meet"
							fill="currentColor"
							width="48"
							height="48"
							><g
								><path
									d="M18.837,27.966c8.342,-0.241 9.163,-1.997 9.163,-11.966c0,-11 -1,-12 -12,-12c-11,0 -12,1 -12,12c0,9.995 0.826,11.734 9.228,11.968c0.073,-0.091 0.1,-0.205 0.1,-0.321c0,-0.25 -0.01,-2.816 -0.015,-3.699c-3.037,0.639 -3.678,-1.419 -3.678,-1.419c-0.497,-1.222 -1.213,-1.548 -1.213,-1.548c-0.991,-0.656 0.075,-0.643 0.075,-0.643c1.096,0.075 1.673,1.091 1.673,1.091c0.974,1.617 2.556,1.15 3.178,0.879c0.099,-0.683 0.381,-1.15 0.693,-1.414c-2.425,-0.267 -4.974,-1.175 -4.974,-5.23c0,-1.155 0.426,-2.099 1.124,-2.839c-0.113,-0.268 -0.487,-1.344 0.107,-2.8c0,0 0.917,-0.285 3.003,1.084c0.871,-0.235 1.805,-0.352 2.734,-0.356c0.927,0.004 1.861,0.121 2.734,0.356c2.085,-1.369 3,-1.084 3,-1.084c0.596,1.456 0.221,2.532 0.108,2.8c0.7,0.74 1.123,1.684 1.123,2.839c0,4.065 -2.553,4.96 -4.986,5.221c0.392,0.327 0.741,0.973 0.741,1.96c0,0.946 -0.006,2.619 -0.01,3.728c-0.002,0.549 -0.003,0.959 -0.003,1.074c0,0.109 0.029,0.224 0.095,0.319Z"
								></path></g
							></svg>
                        </span
					></a
				>
			</div>
			<div class="w-8 h-8 rounded-full flex items-center justify-center">
				<a href="https://linkedin.com/in/gamerwaves" title="LinkedIn"
					><span class="text-[#47ccfc] text-xl"
						><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="currentColor"><mask id="mask0_3_42" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><path d="M39 19.75C39 2.10417 37.3958 0.5 19.75 0.5C2.10417 0.5 0.500008 2.10417 0.500008 19.75" fill="black"/><path d="M39 19.75C39 2.10417 37.3958 0.5 19.75 0.5C2.10417 0.5 0.500008 2.10417 0.500008 19.75" stroke="black"/><path d="M0.5 19.75C0.5 37.3958 2.10417 39 19.75 39C37.3958 39 39 37.3958 39 19.75" fill="black"/><path d="M0.5 19.75C0.5 37.3958 2.10417 39 19.75 39C37.3958 39 39 37.3958 39 19.75" stroke="black"/></mask><g mask="url(#mask0_3_42)"><path d="M36.375 0H2.625C0.898437 0 -0.5 1.39844 -0.5 3.125V36.875C-0.5 38.6016 0.898437 40 2.625 40H36.375C38.1016 40 39.5 38.6016 39.5 36.875V3.125C39.5 1.39844 38.1016 0 36.375 0ZM13.9062 28.3672H10.0078V15.8906H13.9062V28.3672ZM11.8516 14.3281H11.8203C10.4062 14.3281 9.49219 13.375 9.49219 12.1641C9.49219 10.9297 10.4375 10 11.875 10C13.3125 10 14.1953 10.9297 14.2266 12.1641C14.2344 13.3672 13.3203 14.3281 11.8516 14.3281ZM29.5 28.3672H25.0781V21.9141C25.0781 20.2266 24.3906 19.0703 22.8672 19.0703C21.7031 19.0703 21.0547 19.8516 20.7578 20.6016C20.6484 20.8672 20.6641 21.2422 20.6641 21.625V28.3672H16.2813C16.2813 28.3672 16.3359 16.9297 16.2813 15.8906H20.6641V17.8516C20.9219 16.9922 22.3203 15.7734 24.5547 15.7734C27.3281 15.7734 29.5 17.5703 29.5 21.4297V28.3672Z" fill="currentColor"/></g></svg>
                        </span
					></a
				>
			</div>
		</div>
	</div>

	<!-- Main Section -->
	<div id="about" class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
		<!-- PFP -->
		<div class="lg:col-span-3 border-box overflow-hidden">
			<img src="/dogpfp.png" alt="" class="w-full h-full object-cover rounded-none" />
		</div>

		<!-- Main Intro -->
		<div class="lg:col-span-9 border-box p-6 md:p-12">
			<h2 class="text-4xl md:text-5xl lg:text-7xl font-bold text-primary mb-4 md:mb-6">
				Hello,<br />I'm Dwait!
			</h2>
			<p class="text-lg md:text-xl lg:text-2xl text-secondary leading-relaxed">
				I am a full-stack developer who loves building innovative web applications. I specialize in
				modern frameworks and enjoy solving complex problems with simple solutions.
			</p>
		</div>
	</div>

	<!-- Info section thingy -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
		<div class="border-box p-4 md:p-6">
			<div class="flex items-center gap-3 mb-2">
				<span class="text-primary text-sm md:text-base">Location</span>
			</div>
			<p class="text-secondary text-sm md:text-base">GTA, Ontario, Canada</p>
		</div>

		<div class="border-box p-4 md:p-6">
			<div class="flex items-center gap-3 mb-2">
				<span class="text-primary text-sm md:text-base">Phone Number</span>
			</div>
			<p class="text-secondary text-sm md:text-base">Contact me on my email for my phone number.</p>
		</div>

		<a href="mailto:dwait.pandhi@gmail.com">
			<div class="border-box p-4 md:p-6">
				<div class="flex items-center gap-3 mb-2">
					<span class="text-primary text-sm md:text-base">Email</span>
				</div>
				<p class="text-secondary text-sm md:text-base break-all">dwait.pandhi@gmail.com</p>
			</div>
		</a>
	</div>

	<!-- CTA Buttons -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
		<a href="#projects" class="border-box card-hover p-6 md:p-8 flex items-center justify-between group">
			<span class="text-xl md:text-2xl font-bold text-primary">View Projects</span>
			<span class="text-2xl md:text-3xl text-primary group-hover:translate-x-2 transition-transform">→</span>
		</a>

		<a href="#contact" class="border-box card-hover p-6 md:p-8 flex items-center justify-between group">
			<span class="text-xl md:text-2xl font-bold text-primary">Get in Touch</span>
			<span class="text-2xl md:text-3xl text-primary group-hover:translate-x-2 transition-transform">→</span>
		</a>
	</div>

	<!-- Skills Section -->
	<div id="skills" class="mb-4">
		<h2 class="text-3xl md:text-4xl font-bold text-primary mb-4">Skills & Expertise</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each skills as skill}
				<div class="border-box p-6 md:p-8">
					<h3 class="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">{skill.category}</h3>
					<ul class="space-y-2 md:space-y-3">
						{#each skill.items as item}
							<li class="text-secondary text-sm md:text-base flex items-center gap-2">
								<span class="text-primary">▸</span>
								{item}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>

	<!-- Projects Section -->
	<div id="projects" class="mb-4">
		<h2 class="text-3xl md:text-4xl font-bold text-primary mb-4">Featured Projects</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each projects as project}
				<div class="border-box card-hover p-6 md:p-8">
					<h3 class="text-xl md:text-2xl font-bold text-primary mb-3 md:mb-4">{project.title}</h3>
					<p class="text-secondary text-sm md:text-base mb-4 md:mb-6 leading-relaxed">{project.description}</p>
					<div class="flex flex-wrap gap-2 mb-4 md:mb-6">
						{#each project.tech as tech}
							<span class="tech-tag">{tech}</span>
						{/each}
					</div>
					<div class="flex gap-4">
						{#if project.demo}
							<a
								href="https://{project.demo}"
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary hover:text-[#47ccfc] transition-colors font-mono text-xs md:text-sm flex items-center gap-1"
							>
								<span>DEMO</span>
								<span>↗</span>
							</a>
						{/if}
						{#if project.repo}
							<a
								href={project.repo}
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary hover:text-[#47ccfc] transition-colors font-mono text-xs md:text-sm flex items-center gap-1"
							>
								<span>REPO</span>
								<span>↗</span>
							</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Contact Section -->
	<div id="contact" class="mb-4">
		<h2 class="text-3xl md:text-4xl font-bold text-primary mb-4">Let's Connect</h2>
		<div class="border-box p-6 md:p-8">
			<form class="space-y-4 md:space-y-6" on:submit={handleSubmit}>
				<div>
					<label for="name" class="block text-primary text-sm md:text-base mb-2">Name</label>
					<input type="text" id="name" bind:value={formData.name} required class="input-field" />
				</div>
				<div>
					<label for="email" class="block text-primary text-sm md:text-base mb-2">Email</label>
					<input type="email" id="email" bind:value={formData.email} required class="input-field" />
				</div>
				<div>
					<label for="message" class="block text-primary text-sm md:text-base mb-2">Message</label>
					<textarea
						rows="5"
						id="message"
						bind:value={formData.message}
						required
						class="input-field resize-none"
					></textarea>
				</div>

				{#if statusMessage}
					<div
						class="p-3 border-2 border-dashed {formStatus === 'success'
							? 'border-green-500 text-green-500'
							: 'border-red-500 text-red-500'} font-mono text-xs md:text-sm"
					>
						{statusMessage}
					</div>
				{/if}

				<button type="submit" disabled={formStatus === 'sending'} class="btn-primary">
					{formStatus === 'sending' ? 'SENDING...' : 'SEND MESSAGE'}
				</button>
			</form>
		</div>
	</div>
</div>
