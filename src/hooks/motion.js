import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText)

// House eases: a slow cinematic push, and a quick shutter snap
CustomEase.create('cine', 'M0,0 C0.62,0 0.12,1 1,1')
CustomEase.create('shutter', 'M0,0 C0.8,0 0.2,1 1,1')
CustomEase.create('settle', 'M0,0 C0.16,1 0.3,1 1,1')

export { gsap, ScrollTrigger, SplitText }
