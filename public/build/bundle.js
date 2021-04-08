
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Components/Navbar.svelte generated by Svelte v3.37.0 */

    const file$6 = "src/Components/Navbar.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let nav;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let a1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			a1 = element("a");
    			a1.textContent = "Try It Free";
    			attr_dev(img, "class", "h-full object-contain");
    			if (img.src !== (img_src_value = "./images/logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 3, 12, 231);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "h-5 md:h-7 xl:h-10");
    			add_location(a0, file$6, 2, 8, 179);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "no-underline text-black font-secondary font-semibold bg-white shadow-md  hover:shadow-lg rounded-full py-2 px-7 md:py-3 md:px-14");
    			add_location(a1, file$6, 5, 8, 319);
    			attr_dev(nav, "class", "max-w-screen-2xl mx-auto flex items-center justify-between px-6 h-24 md:px-24 xl:px-44");
    			add_location(nav, file$6, 1, 4, 70);
    			attr_dev(header, "class", "w-full bg-transparent absolute top-0 left-0 z-30");
    			add_location(header, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, a0);
    			append_dev(a0, img);
    			append_dev(nav, t0);
    			append_dev(nav, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Components/Hero.svelte generated by Svelte v3.37.0 */

    const file$5 = "src/Components/Hero.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div2;
    	let div0;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let a;
    	let t5;
    	let div1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Build The Community Your Fans Will Love";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Huddle re-imagines the way we build communities. You have a voice, but\n        so does your audience. Create connections with your users as you engage\n        in genuine discussion.";
    			t3 = space();
    			a = element("a");
    			a.textContent = "Get Started For Free";
    			t5 = space();
    			div1 = element("div");
    			img = element("img");
    			attr_dev(h1, "class", "text-2xl font-secondary font-bold leading-normal text-secondary-200 text-center md:text-left ");
    			add_location(h1, file$5, 3, 6, 230);
    			attr_dev(p, "class", "text-lg mt-8 text-secondary-200 font-primary leading-normal text-center font-normal md:text-left");
    			add_location(p, file$5, 8, 6, 418);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "mt-8 bg-primary font-secondary hover:opacity-80 font-bold text-white text-center leading-none px-12 py-5 rounded-full   block");
    			add_location(a, file$5, 13, 6, 734);
    			attr_dev(div0, "class", "flex flex-col items-center w-full md:w-1/2 md:items-start md:pr-10");
    			add_location(div0, file$5, 2, 4, 143);
    			attr_dev(img, "class", "w-full object-contain");
    			if (img.src !== (img_src_value = "./images/illustration-mockups.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 18, 8, 988);
    			attr_dev(div1, "class", "w-full mt-10 md:mt-0 md:w-1/2");
    			add_location(div1, file$5, 17, 4, 936);
    			attr_dev(div2, "class", "max-w-screen-2xl px-8 pt-40  pb-12 flex flex-wrap items-center md:px-24 xl:px-44 ");
    			add_location(div2, file$5, 1, 2, 43);
    			attr_dev(section, "class", "w-full bg-hero-mobile ");
    			add_location(section, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p);
    			append_dev(div0, t3);
    			append_dev(div0, a);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hero", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Components/FeatureCard.svelte generated by Svelte v3.37.0 */

    const file$4 = "src/Components/FeatureCard.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h2;
    	let t1;
    	let t2;
    	let p;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			p = element("p");
    			t3 = text(/*body*/ ctx[1]);
    			attr_dev(img, "class", "w-full object-contain");
    			if (img.src !== (img_src_value = /*src*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[4]);
    			add_location(img, file$4, 10, 8, 321);
    			attr_dev(div0, "class", "w-full md:w-1/2");
    			add_location(div0, file$4, 9, 4, 283);
    			attr_dev(h2, "class", "text-secondary-200 text-xl font-primary font-bold text-center md:text-left lg:text-2xl");
    			add_location(h2, file$4, 13, 8, 444);
    			attr_dev(p, "class", "mt-6 text-lg text-center md:text-left text-secondary-300");
    			add_location(p, file$4, 14, 8, 564);
    			attr_dev(div1, "class", "w-full mt-8 md:w-1/2 md:mt-0 md:px-9");
    			add_location(div1, file$4, 12, 4, 385);
    			attr_dev(div2, "class", "w-full flex flex-wrap items-center shadow-md  px-9 py-8 rounded-2xl  mb-6 md:mb-12 xl:mb-16");
    			toggle_class(div2, "flex-row-reverse", /*reverse*/ ctx[2]);
    			add_location(div2, file$4, 8, 0, 140);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			append_dev(div1, p);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*src*/ 8 && img.src !== (img_src_value = /*src*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 16) {
    				attr_dev(img, "alt", /*alt*/ ctx[4]);
    			}

    			if (dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);
    			if (dirty & /*body*/ 2) set_data_dev(t3, /*body*/ ctx[1]);

    			if (dirty & /*reverse*/ 4) {
    				toggle_class(div2, "flex-row-reverse", /*reverse*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FeatureCard", slots, []);
    	let { title } = $$props;
    	let { body } = $$props;
    	let { reverse = false } = $$props;
    	let { src } = $$props;
    	let { alt = "" } = $$props;
    	const writable_props = ["title", "body", "reverse", "src", "alt"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FeatureCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("body" in $$props) $$invalidate(1, body = $$props.body);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(4, alt = $$props.alt);
    	};

    	$$self.$capture_state = () => ({ title, body, reverse, src, alt });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("body" in $$props) $$invalidate(1, body = $$props.body);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("src" in $$props) $$invalidate(3, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(4, alt = $$props.alt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, body, reverse, src, alt];
    }

    class FeatureCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			title: 0,
    			body: 1,
    			reverse: 2,
    			src: 3,
    			alt: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FeatureCard",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<FeatureCard> was created without expected prop 'title'");
    		}

    		if (/*body*/ ctx[1] === undefined && !("body" in props)) {
    			console.warn("<FeatureCard> was created without expected prop 'body'");
    		}

    		if (/*src*/ ctx[3] === undefined && !("src" in props)) {
    			console.warn("<FeatureCard> was created without expected prop 'src'");
    		}
    	}

    	get title() {
    		throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get body() {
    		throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set body(value) {
    		throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<FeatureCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<FeatureCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/FeatureList.svelte generated by Svelte v3.37.0 */

    const file$3 = "src/Components/FeatureList.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "w-full flex flex-wrap items-center");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FeatureList", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FeatureList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class FeatureList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FeatureList",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Components/FeaturesSection.svelte generated by Svelte v3.37.0 */
    const file$2 = "src/Components/FeaturesSection.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (14:12) {#each features as feature (feature.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let featurecard;
    	let current;

    	featurecard = new FeatureCard({
    			props: {
    				title: /*feature*/ ctx[1].title,
    				body: /*feature*/ ctx[1].body,
    				src: /*feature*/ ctx[1].src,
    				alt: /*feature*/ ctx[1].alt,
    				reverse: /*feature*/ ctx[1].reverse
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(featurecard.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(featurecard, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(featurecard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(featurecard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(featurecard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(14:12) {#each features as feature (feature.id)}",
    		ctx
    	});

    	return block;
    }

    // (13:8) <FeatureList>
    function create_default_slot(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*features*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*feature*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*features*/ 1) {
    				each_value = /*features*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(13:8) <FeatureList>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let div0;
    	let featurelist;
    	let t0;
    	let div1;
    	let h2;
    	let t2;
    	let a;
    	let current;

    	featurelist = new FeatureList({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			create_component(featurelist.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Ready To Build Your Community?";
    			t2 = space();
    			a = element("a");
    			a.textContent = "Get Started For Free";
    			attr_dev(div0, "class", "max-w-screen-2xl pt-12 mx-auto px-6 pb-40 md:pt-20 md:px-24 xl:px-44 xl:pb-52 xl:pt-28");
    			add_location(div0, file$2, 11, 4, 979);
    			attr_dev(h2, "class", "font-secondary  text-xl text-secondary-200 text-center font-bold");
    			add_location(h2, file$2, 25, 8, 1637);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "mt-8 bg-primary shadow-md font-secondary font-bold text-white text-center leading-none px-12 py-5 rounded-full block hover:opacity-80 max-w-xs mx-auto");
    			add_location(a, file$2, 26, 8, 1759);
    			attr_dev(div1, "class", "bg-white w-11/12   max-w-screen-sm  absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2  px-7 py-10 -mb-1/2 shadow-lg rounded-2xl");
    			add_location(div1, file$2, 24, 4, 1467);
    			attr_dev(section, "class", "w-full bg-white relative");
    			add_location(section, file$2, 10, 0, 932);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			mount_component(featurelist, div0, null);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const featurelist_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				featurelist_changes.$$scope = { dirty, ctx };
    			}

    			featurelist.$set(featurelist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(featurelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(featurelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(featurelist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FeaturesSection", slots, []);

    	let features = [
    		{
    			src: "./images/illustration-grow-together.svg",
    			title: "Grow Together",
    			body: " Generate meaningful discussions with your audience and build a strong, loyal community. Think of the insightful conversations you miss out on with a feedback form.",
    			id: 1
    		},
    		{
    			reverse: true,
    			src: "./images/illustration-flowing-conversation.svg",
    			title: "Flowing Conversations ",
    			body: "You wouldn't paginate a conversation in real life, so why do it online? Our threads have just-in-time loading for a more natural flow.",
    			id: 2
    		},
    		{
    			src: "./images/illustration-your-users.svg",
    			title: "Your Users",
    			body: "It takes no time at all to integrate Huddle with your app's authentication solution. This means, once signed in to your app, your users can start chatting immediately.",
    			id: 3
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FeaturesSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ FeatureCard, FeatureList, features });

    	$$self.$inject_state = $$props => {
    		if ("features" in $$props) $$invalidate(0, features = $$props.features);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [features];
    }

    class FeaturesSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FeaturesSection",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Components/Footer.svelte generated by Svelte v3.37.0 */

    const file$1 = "src/Components/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div7;
    	let div5;
    	let div4;
    	let div0;
    	let svg;
    	let g;
    	let path0;
    	let path1;
    	let t0;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let p0;
    	let t3;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let p1;
    	let t6;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t7;
    	let p2;
    	let t9;
    	let ul0;
    	let li0;
    	let t11;
    	let li1;
    	let t13;
    	let li2;
    	let t15;
    	let ul1;
    	let li3;
    	let t17;
    	let li4;
    	let t19;
    	let li5;
    	let t21;
    	let div6;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div7 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";
    			t3 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "+1-543-123-4567";
    			t6 = space();
    			div3 = element("div");
    			img2 = element("img");
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = "example@fylo.com";
    			t9 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "About Us";
    			t11 = space();
    			li1 = element("li");
    			li1.textContent = "What We Do";
    			t13 = space();
    			li2 = element("li");
    			li2.textContent = "FAQ";
    			t15 = space();
    			ul1 = element("ul");
    			li3 = element("li");
    			li3.textContent = "Career";
    			t17 = space();
    			li4 = element("li");
    			li4.textContent = "Blog";
    			t19 = space();
    			li5 = element("li");
    			li5.textContent = "Contact Us";
    			t21 = space();
    			div6 = element("div");
    			div6.textContent = "© Copyright 2018 Huddle. All rights reserved.";
    			attr_dev(path0, "d", "M27.967.879C20.242.875 12.182 2.615 4.047 4.872c-1.033.208-2.041.884-2.574 1.72C.983 7.38.805 8.171.652 9c-.79 4.428-.694 8.776-.53 13.594.036 1.103.2 2.41.715 3.205.538.803 1.46 1.313 2.561 1.48a95.99 95.99 0 0 0 4.232.525l-.312 8.698c-.048.692.29 1.267.71 1.598.376.286.795.413 1.225.445.86.065 1.869-.303 2.37-1.257 2.195-4.224 3.572-6.089 6.317-8.895 7.158.176 13.407-.222 20.482-.745 2.501-.065 4.218-2.11 4.672-3.743 1.357-4.232 1.568-9.456 1.712-14.737.061-2.093-.665-4.148-1.95-5.234-1.222-.991-2.702-1.35-4.058-1.718C35.031 1.363 31.263.905 27.967.879zm10.29 3.31c1.358.369 2.555.724 3.31 1.337 1.26 1.339 1.218 2.23 1.2 3.675-.142 5.122-.388 10.093-1.544 13.86-.498 1.405-1.366 2.405-3.006 2.556-7.208.533-13.462.945-20.707.739a1.032 1.032 0 0 0-.763.302c-3.044 3.074-4.601 5.21-6.921 9.676-.054.102-.171.164-.315.175-.097-.005-.136-.08-.142-.148l.314-9.432c.019-.509-.401-.995-.907-1.05a95.48 95.48 0 0 1-5.06-.62c-.726-.111-.994-.31-1.193-.606-.346-.825-.338-1.335-.365-2.128-.162-4.775-.242-8.948.491-13.1.068-.614.298-1.242.542-1.767.404-.632 1.023-.725 1.644-.897 7.956-2.197 15.74-3.84 23.068-3.845 3.592.13 7.364.49 10.354 1.273zm-27.479 8.09c-1.096 1.313-.987 3.096-.14 4.29.442.625 1.132 1.128 1.972 1.242 1.091.09 1.783-.352 2.53-.86 1.353-1.176 1.49-3.228.461-4.71-.524-.755-1.362-1.208-2.218-1.24-1.172.012-1.968.535-2.605 1.277zm11.856-1.072c-1.092.035-1.975.791-2.514 1.607-.617.933-.977 2.101-.478 3.246.96 2.203 4.277 2.176 5.6-.063.61-1.032.454-2.205 0-3.056-.452-.85-1.136-1.543-2.131-1.702a2.494 2.494 0 0 0-.477-.032zm9.625.207c-.34-.008-.69.024-1.018.111-1.312.35-2.429 1.704-2.26 3.437.086.872.487 1.722 1.21 2.308.723.585 1.773.847 2.88.62 1.272-.26 2.06-1.285 2.323-2.275.263-.99.197-1.999-.414-2.817a3.47 3.47 0 0 0-2.72-1.384zm-18.965 1.623c.245.002.438.08.637.366.445.642.321 1.615-.128 2.005-.447.39-.726.424-.922.398-.196-.027-.395-.162-.573-.414-.34-.48-.44-1.256.007-1.81.238-.316.675-.513.98-.545zm9.483.223c.038.006.464.253.668.636.204.383.242.739.048 1.066-.577.976-1.804.712-1.99.287-.07-.162-.017-.813.32-1.32.335-.509.757-.7.954-.67zm10.564.748c.062.083.213.64.096 1.082-.118.442-.31.715-.78.811-.602.124-.94 0-1.193-.207-.254-.205-.425-.552-.462-.923-.09-.92.24-1.133.764-1.273.61-.15 1.3.112 1.575.51z");
    			attr_dev(path0, "fill", "#fff");
    			add_location(path0, file$1, 7, 15, 402);
    			attr_dev(path1, "d", "M57.61 4.996c.016-.26.111-.494.287-.701a.875.875 0 0 1 .701-.31h6.826c.23 0 .467.096.712.287a.883.883 0 0 1 .368.724v10.893h11.421V4.996c0-.276.096-.513.287-.712.192-.2.44-.3.747-.3h6.734c.306 0 .574.077.804.23.23.154.345.399.345.736V37.1c0 .337-.1.59-.3.758-.198.169-.459.253-.78.253h-6.803c-.306 0-.555-.084-.747-.253-.191-.168-.287-.42-.287-.758V24.047H66.504V37.1c0 .322-.104.57-.31.747-.207.176-.487.264-.84.264h-6.756c-.643 0-.972-.299-.988-.896V4.996zm62.875 32.725c-.199.168-.41.275-.632.321a3.123 3.123 0 0 1-.631.07h-3.47c-.276 0-.514-.05-.713-.15-.2-.1-.368-.234-.506-.402a2.384 2.384 0 0 1-.344-.575 4.884 4.884 0 0 1-.23-.666l-.712-2.942c-.23.475-.563 1.015-1 1.62a8.495 8.495 0 0 1-1.666 1.7c-.674.53-1.479.974-2.413 1.334-.935.36-2.007.54-3.218.54-1.746 0-3.332-.337-4.757-1.011a10.904 10.904 0 0 1-3.642-2.758c-1.003-1.164-1.781-2.524-2.332-4.08-.552-1.554-.828-3.213-.828-4.974V10.695c0-.582.127-1.022.38-1.321.252-.299.654-.448 1.206-.448h5.308c.66 0 1.111.11 1.356.333.245.222.368.655.368 1.298v14.96c0 .66.15 1.284.448 1.874.299.59.693 1.11 1.184 1.562.49.452 1.045.809 1.666 1.069.62.26 1.252.39 1.896.39.551 0 1.122-.13 1.712-.39a6.361 6.361 0 0 0 1.631-1.046c.498-.436.908-.95 1.23-1.54.322-.59.482-1.214.482-1.872V10.626c0-.26.05-.52.15-.781.1-.26.249-.46.448-.598.199-.122.387-.206.563-.252.176-.046.38-.07.609-.07h5.194c.658 0 1.133.162 1.424.483.291.322.437.751.437 1.287v25.716c0 .29-.065.559-.195.804s-.31.437-.54.574l.137-.068zm26.681-3.172c-.414.414-.87.858-1.367 1.333-.498.475-1.046.92-1.643 1.333a9.3 9.3 0 0 1-1.93 1.023 6.097 6.097 0 0 1-2.23.402c-2.083 0-4.002-.39-5.757-1.172a13.777 13.777 0 0 1-4.527-3.206c-1.264-1.356-2.252-2.953-2.964-4.792-.713-1.838-1.069-3.814-1.069-5.929 0-2.13.356-4.11 1.069-5.94.712-1.83 1.7-3.424 2.964-4.78a13.635 13.635 0 0 1 4.527-3.194c1.755-.774 3.674-1.161 5.757-1.161.843 0 1.613.123 2.31.368a8.51 8.51 0 0 1 1.907.942c.575.383 1.103.816 1.586 1.298.482.483.938.954 1.367 1.414V1.985c0-.49.15-.903.448-1.24.299-.338.747-.506 1.345-.506h5.17c.2 0 .41.042.632.126.222.085.425.203.61.357.183.153.332.337.447.551.115.215.173.452.173.712v34.357c0 1.18-.62 1.77-1.862 1.77h-4.504c-.306 0-.544-.04-.712-.116a1.13 1.13 0 0 1-.426-.333 2.319 2.319 0 0 1-.31-.551 17.13 17.13 0 0 0-.344-.77l-.667-1.793zm-13.214-11.008a8.39 8.39 0 0 0 .471 2.839c.314.88.762 1.643 1.345 2.286a6.384 6.384 0 0 0 2.102 1.528c.82.376 1.728.563 2.724.563.98 0 1.903-.176 2.769-.528a7.058 7.058 0 0 0 2.263-1.46 7.256 7.256 0 0 0 1.552-2.194c.39-.843.609-1.747.655-2.712v-.322a7.26 7.26 0 0 0-.552-2.803 7.427 7.427 0 0 0-1.528-2.344 7.242 7.242 0 0 0-2.298-1.597 6.977 6.977 0 0 0-2.861-.586c-.996 0-1.904.195-2.724.586-.82.39-1.52.923-2.102 1.597a7.236 7.236 0 0 0-1.345 2.344 8.35 8.35 0 0 0-.47 2.803zm48.72 11.008c-.414.414-.87.858-1.368 1.333-.498.475-1.046.92-1.643 1.333a9.3 9.3 0 0 1-1.93 1.023 6.097 6.097 0 0 1-2.23.402c-2.083 0-4.002-.39-5.756-1.172a13.777 13.777 0 0 1-4.528-3.206c-1.263-1.356-2.252-2.953-2.964-4.792-.712-1.838-1.069-3.814-1.069-5.929 0-2.13.357-4.11 1.069-5.94s1.7-3.424 2.964-4.78a13.635 13.635 0 0 1 4.528-3.194c1.754-.774 3.673-1.161 5.756-1.161.843 0 1.613.123 2.31.368a8.51 8.51 0 0 1 1.907.942c.575.383 1.103.816 1.586 1.298.483.483.938.954 1.367 1.414V1.985c0-.49.15-.903.448-1.24.3-.338.747-.506 1.345-.506h5.17c.2 0 .41.042.632.126.223.085.426.203.61.357.183.153.333.337.448.551.114.215.172.452.172.712v34.357c0 1.18-.62 1.77-1.862 1.77h-4.504c-.306 0-.544-.04-.712-.116a1.13 1.13 0 0 1-.425-.333 2.319 2.319 0 0 1-.31-.551 17.13 17.13 0 0 0-.345-.77l-.667-1.793zm-13.215-11.008a8.39 8.39 0 0 0 .471 2.839c.315.88.763 1.643 1.345 2.286a6.384 6.384 0 0 0 2.103 1.528c.82.376 1.727.563 2.723.563.98 0 1.903-.176 2.769-.528a7.058 7.058 0 0 0 2.264-1.46 7.256 7.256 0 0 0 1.55-2.194c.391-.843.61-1.747.656-2.712v-.322a7.26 7.26 0 0 0-.552-2.803 7.427 7.427 0 0 0-1.528-2.344 7.242 7.242 0 0 0-2.298-1.597 6.977 6.977 0 0 0-2.861-.586c-.996 0-1.904.195-2.723.586-.82.39-1.521.923-2.103 1.597a7.236 7.236 0 0 0-1.345 2.344 8.35 8.35 0 0 0-.47 2.803zM197.61 2.008c0-.49.122-.903.367-1.24.246-.338.667-.506 1.264-.506h5.63c.154 0 .315.042.483.126a1.7 1.7 0 0 1 .471.357c.146.153.268.337.368.551.1.215.15.452.15.712v34.334c0 .582-.165 1.022-.495 1.321-.329.299-.754.448-1.275.448h-5.332c-.597 0-1.018-.15-1.264-.448-.245-.299-.367-.74-.367-1.321V2.008zm38.7 32.61a15.31 15.31 0 0 1-4.55 2.907 13.87 13.87 0 0 1-5.355 1.046c-2.1 0-4.083-.383-5.952-1.15a15.494 15.494 0 0 1-4.918-3.182 15.273 15.273 0 0 1-3.355-4.792c-.828-1.838-1.241-3.837-1.241-5.998 0-1.348.164-2.654.494-3.918a15.45 15.45 0 0 1 1.402-3.55 15.055 15.055 0 0 1 2.206-3.045 13.957 13.957 0 0 1 2.907-2.379 14.327 14.327 0 0 1 3.493-1.54 14.084 14.084 0 0 1 3.975-.551c1.272 0 2.505.169 3.7.506 1.195.337 2.318.812 3.367 1.424 1.05.613 2.01 1.349 2.884 2.207a14.896 14.896 0 0 1 2.252 2.815 13.58 13.58 0 0 1 1.46 3.263c.344 1.157.517 2.348.517 3.573 0 .797-.012 1.448-.035 1.954-.023.505-.142.908-.356 1.206-.215.3-.57.506-1.069.62-.498.116-1.23.173-2.194.173h-16.546c.153.98.463 1.8.93 2.46a5.842 5.842 0 0 0 1.62 1.573c.613.391 1.264.67 1.954.84a8.24 8.24 0 0 0 1.953.252c.552 0 1.118-.058 1.7-.172a12.179 12.179 0 0 0 1.69-.46 9.557 9.557 0 0 0 1.493-.667c.452-.252.816-.517 1.092-.792.245-.2.456-.349.632-.449.176-.1.364-.149.563-.149.2 0 .402.07.61.207a4.8 4.8 0 0 1 .7.597l2.436 2.758c.168.2.276.38.322.54.046.161.069.326.069.494 0 .307-.085.571-.253.793a2.89 2.89 0 0 1-.598.586zm-11.054-19.143c-.598 0-1.176.119-1.735.356a6.547 6.547 0 0 0-1.575.954c-.49.398-.93.85-1.321 1.356a8.315 8.315 0 0 0-.954 1.54h11.743a13.536 13.536 0 0 0-1.045-1.655 7.081 7.081 0 0 0-1.287-1.333 5.558 5.558 0 0 0-1.655-.896c-.62-.215-1.344-.322-2.171-.322z");
    			attr_dev(path1, "fill", "#fff");
    			add_location(path1, file$1, 10, 16, 2723);
    			attr_dev(g, "fill-rule", "nonzero");
    			attr_dev(g, "fill", "none");
    			add_location(g, file$1, 6, 13, 352);
    			attr_dev(svg, "width", "250");
    			attr_dev(svg, "height", "50");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$1, 5, 10, 275);
    			add_location(div0, file$1, 4, 8, 259);
    			if (img0.src !== (img0_src_value = "./images/icon-location.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 18, 12, 8630);
    			attr_dev(p0, "class", "ml-4");
    			add_location(p0, file$1, 19, 12, 8689);
    			attr_dev(div1, "class", "flex mt-8 items-start text-secondary-100 font-primary text-base ");
    			add_location(div1, file$1, 17, 8, 8539);
    			if (img1.src !== (img1_src_value = "./images/icon-phone.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 22, 12, 8947);
    			attr_dev(p1, "class", "ml-4");
    			add_location(p1, file$1, 23, 12, 9003);
    			attr_dev(div2, "class", "flex mt-4 items-center text-secondary-100 font-primary text-base ");
    			add_location(div2, file$1, 21, 8, 8855);
    			if (img2.src !== (img2_src_value = "./images/icon-email.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$1, 26, 12, 9155);
    			attr_dev(p2, "class", "ml-4");
    			add_location(p2, file$1, 27, 12, 9211);
    			attr_dev(div3, "class", "flex mt-4 items-center text-secondary-100 font-primary text-base ");
    			add_location(div3, file$1, 25, 8, 9063);
    			attr_dev(div4, "class", "w-full flex flex-col items-start md:w-1/2 md:pr-8");
    			add_location(div4, file$1, 3, 6, 187);
    			attr_dev(li0, "class", "text-lg text-secondary-100");
    			add_location(li0, file$1, 31, 8, 9343);
    			attr_dev(li1, "class", "text-lg text-secondary-100 mt-4");
    			add_location(li1, file$1, 32, 8, 9404);
    			attr_dev(li2, "class", "text-lg text-secondary-100 mt-4");
    			add_location(li2, file$1, 33, 8, 9473);
    			attr_dev(ul0, "class", "w-full list-none md:w-1/4 mt-12 md:mt-0");
    			add_location(ul0, file$1, 30, 6, 9282);
    			attr_dev(li3, "class", "text-lg text-secondary-100");
    			add_location(li3, file$1, 36, 8, 9604);
    			attr_dev(li4, "class", "text-lg text-secondary-100 mt-4");
    			add_location(li4, file$1, 37, 8, 9663);
    			attr_dev(li5, "class", "text-lg text-secondary-100 mt-4");
    			add_location(li5, file$1, 38, 8, 9725);
    			attr_dev(ul1, "class", "w-full list-none md:w-1/4 mt-4 md:mt-0");
    			add_location(ul1, file$1, 35, 6, 9544);
    			attr_dev(div5, "class", "flex items-center flex-wrap");
    			add_location(div5, file$1, 2, 4, 139);
    			attr_dev(div6, "class", "text-base text-center text-secondary-100 mt-14");
    			add_location(div6, file$1, 41, 4, 9812);
    			attr_dev(div7, "class", "max-w-screen-2xl mx-auto");
    			add_location(div7, file$1, 1, 2, 96);
    			attr_dev(footer, "class", "w-full bg-secondary-200 px-6 pb-12 pt-56 md:px-24 xl:px-44 md:pb-20 xl:pb-24");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div7);
    			append_dev(div7, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t4);
    			append_dev(div2, p1);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, img2);
    			append_dev(div3, t7);
    			append_dev(div3, p2);
    			append_dev(div5, t9);
    			append_dev(div5, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t11);
    			append_dev(ul0, li1);
    			append_dev(ul0, t13);
    			append_dev(ul0, li2);
    			append_dev(div5, t15);
    			append_dev(div5, ul1);
    			append_dev(ul1, li3);
    			append_dev(ul1, t17);
    			append_dev(ul1, li4);
    			append_dev(ul1, t19);
    			append_dev(ul1, li5);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.37.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let navbar;
    	let t0;
    	let main;
    	let herosection;
    	let t1;
    	let featuressection;
    	let t2;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	herosection = new Hero({ $$inline: true });
    	featuressection = new FeaturesSection({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(herosection.$$.fragment);
    			t1 = space();
    			create_component(featuressection.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file, 8, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(herosection, main, null);
    			append_dev(main, t1);
    			mount_component(featuressection, main, null);
    			insert_dev(target, t2, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(herosection.$$.fragment, local);
    			transition_in(featuressection.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(herosection.$$.fragment, local);
    			transition_out(featuressection.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(herosection);
    			destroy_component(featuressection);
    			if (detaching) detach_dev(t2);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navbar,
    		HeroSection: Hero,
    		FeaturesSection,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
