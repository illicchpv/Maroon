import { useEffect, useRef, useState } from 'react'
import {
    DirectionType,
    SliderHookReturnType,
    SliderLogicType
} from 'shared/types/slider.type'
import { DraggableData, DraggableEvent } from 'react-draggable'
import { slideChildrens } from 'utils/slideChildrens/slideChildrens'

export function useSlider({
    countSwipe = 1,
    duration = 300,
    initialIndex = 0,
    gap = 10
}: Partial<SliderLogicType>): SliderHookReturnType {
    const slidesRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<number | null>(null)
    const [translate, setTranslate] = useState(0)
    const [indexActive, setIndexActive] = useState(initialIndex)
    const [direction, setDirection] = useState<DirectionType | null>(null)
    const [needUpdate, setNeedUpdate] = useState(false)
    const [step, setStep] = useState(0)
    const [totalCount, setTotalCount] = useState<null | number>(null)

    // Функция на событие onDrag в библиотеки react-draggable
    function onDrag(event: DraggableEvent, data: DraggableData) {
        const deltaX = data.deltaX * 0.7

        if (deltaX < 0) {
            setDirection('right')
        } else if (deltaX > 0) {
            setDirection('left')
        }

        setTranslate((state) => state + deltaX)
    }

    // Функция на событие onStop в библиотеки react-draggable
    function onStop(event: DraggableEvent, data: DraggableData) {
        if (!slidesRef.current || !totalCount) return

        if (translate > 0 && direction === 'left') {
            setStep(0)
            setIndexActive(0)

            setNeedUpdate(true)

            return
        }

        if ((step + 1) * countSwipe >= totalCount && direction === 'right') {
            setNeedUpdate(true)

            return
        }

        if (direction === 'right') {
            swipeRight()
        }
        if (direction === 'left') {
            swipeLeft()
        }

        setDirection(null)
    }

    // Свайп влево
    function swipeLeft() {
        if (step <= 0) return

        setStep((state) => state - 1)
        setIndexActive((state) => state - countSwipe)
    }

    // Свайп вправо
    function swipeRight() {
        if (!slidesRef.current || !totalCount) return

        if ((step + 1) * countSwipe >= totalCount) return

        setStep((state) => state + 1)
        setIndexActive((state) => state + countSwipe)
    }

    // Придаёт ref - slidesRef определённую продолжительность анимации
    function makeDuration(fnc: () => void) {
        if (!slidesRef.current) return
        fnc()

        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        slidesRef.current.style.transitionDuration = `${duration}ms`

        timerRef.current = setTimeout(() => {
            slidesRef.current!.style.transitionDuration = '0ms'
        }, duration)
    }

    // Изменение состояния translate
    useEffect(() => {
        if (!slidesRef.current) return

        const childrens = slideChildrens(slidesRef)

        const newTransform = childrens
            .slice(0, indexActive)
            .reduce((acc, children) => acc - children.offsetWidth - gap, 0)

        makeDuration(() => {
            setTranslate(newTransform)
        })

        setTotalCount(childrens.length)
        setNeedUpdate(false)
    }, [gap, indexActive, needUpdate])

    return {
        slidesRef,
        translate,
        indexActive,
        direction,
        step,
        onDrag,
        onStop,
        swipeLeft,
        swipeRight,
        totalCount
    }
}
