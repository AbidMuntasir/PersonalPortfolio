import { useState, useEffect, useRef } from "react";

interface UseTypingEffectProps {
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBeforeDelete?: number;
  delayBeforeType?: number;
}

export const useTypingEffect = (
  words: string[],
  {
    typingSpeed = 100,
    deleteSpeed = 50,
    delayBeforeDelete = 1000,
    delayBeforeType = 300,
  }: UseTypingEffectProps = {}
) => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[wordIndex];

    let timer: NodeJS.Timeout;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Initial delay before typing starts
      timer = setTimeout(() => {
        setText(currentWord.charAt(0));
      }, delayBeforeType);
      return () => clearTimeout(timer);
    }

    if (isDeleting) {
      // Deleting characters
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(prev => prev.substring(0, prev.length - 1));
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setWordIndex(prev => (prev + 1) % words.length);
        timer = setTimeout(() => {}, delayBeforeType);
      }
    } else {
      // Typing characters
      if (text.length < currentWord.length) {
        timer = setTimeout(() => {
          setText(prev => currentWord.substring(0, prev.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDelete);
      }
    }

    return () => clearTimeout(timer);
  }, [
    text,
    isDeleting,
    wordIndex,
    words,
    typingSpeed,
    deleteSpeed,
    delayBeforeDelete,
    delayBeforeType,
  ]);

  return text;
};
