// Creating shuffled array of continuous values of input range and creating div (bars) with appropriate heights
const createBarsArray = function (range){

    function createBar(heightValue){
        const div = document.createElement('div');
        div.style.height = `${heightValue * proportion}%`;
        return div;
    }

    function shuffleArray(array) {

        // Fisher-Yates (aka Knuth) Shuffle.
        // Concept from http://sedition.com/perl/javascript-fy.html
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [ array[currentIndex], array[randomIndex] ] = [ array[randomIndex], array[currentIndex] ];
        }
    }

    const array = Array.from({length: range}, (_, index) => index + 1);

    shuffleArray(array);

    return { 
        valueArray: array,
        divArray: array.map(createBar)
    };
};

// Sorting helper functions for logical and visual changes
const {compare, swapLogic, setHeightDirectly } = (function (){
    
    const sleepFn = (delayTiming) => new Promise(_ => setTimeout(_, delayTiming));

    async function swapLogic(idx1, idx2, {valueArray, divArray, delayTiming}){

        await sleepFn(delayTiming);

        const value1 = valueArray[idx1],
            value2 = valueArray[idx2];

        // Swapping original values
        valueArray[idx1] = value2;
        valueArray[idx2] = value1;

        // Altering respective bar heights
        divArray[idx1].style.height = `${value2 * proportion}%`;
        divArray[idx2].style.height = `${value1 * proportion}%`;
    }

    async function setHeightDirectly(idx, value, {valueArray, divArray, delayTiming}, optionalArray){

        divArray[idx].className = 'selectedBar1';

        await sleepFn(delayTiming);
        
        divArray[idx].className = '';

        (optionalArray || valueArray)[idx] = value;

        // Altering respective bar heights
        divArray[idx].style.height = `${value * proportion}%`;
    }

    async function compare(idx1, idx2, {valueArray, divArray, delayTiming}, arr1, arr2, offset1 = 0, offset2 = 0){

        divArray[idx1 + offset1].className = 'selectedBar1';
        divArray[idx2 + offset2].className = 'selectedBar2';

        await sleepFn(delayTiming);
        
        divArray[idx1 + offset1].className = '';
        divArray[idx2 + offset2].className = '';

        // Alter this for more comparisions or take up a callback for comparator
        
        if(arr1 && arr2) // Optional arrays
            return arr1[idx1] < arr2[idx2];

        return valueArray[idx1] < valueArray[idx2];
    }

    return {
        compare,
        swapLogic,
        setHeightDirectly,
    }
})();

// User event handling helpers - Event -> UI
const ArraySortingUtils = (function(){
    // Impure function
    function createNewGraph(){
        const { valueArray, divArray } = createBarsArray(range);
        
        // Resetting children
        container.innerHTML = '';
        divArray.forEach(child => container.append(child) );
        
        sortingDetails = { ...sortingDetails, valueArray, divArray };
    }

    // Impure function
    function alterRange(inp){
        range = inp * arraySizeMultiplier;
        proportion = 100 / range;

        createNewGraph();
    }

    // Impure function
    function alterSpeed(speed){
        // Reversing limit
        sortingDetails.delayTiming = 50 - speed;
    }
    
    return {alterRange, alterSpeed, createNewGraph};
})();

// Collections of sorting algorithms
const SortingAlgos = (function (){

    async function bubbleSort(sortingProps){

        const { valueArray } = sortingProps;
     
        for(let i = 0; i < valueArray.length; i++)
          for(let j = 0; j < ( valueArray.length - i - 1 ); j++){
            if(stopOnGoingSort) return;
            if(await compare(j+1, j, sortingProps))
                await swapLogic(j, j+1, sortingProps);
          }
    }

    async function selectionSort(sortingProps){

        const { valueArray } = sortingProps;

        for (let i = 0, min_idx = 0, n = valueArray.length; i < n-1; min_idx = ++i) {
            for (let j = i + 1; j < n; j++){
                if(stopOnGoingSort) return;
                if(await compare(j, min_idx, sortingProps))
                    min_idx = j;
            }
            await swapLogic(min_idx, i, sortingProps);
        }
    }

    async function quickSort(sortingProps){

        const { valueArray } = sortingProps;

        async function partition (arr, low, high){ 
            let i = low - 1;

            for (let j = low; j <= high - 1; j++){
                if(stopOnGoingSort) return;
                if(await compare(j, high, sortingProps))
                    await swapLogic(++i, j, sortingProps);
            }
            await swapLogic(i+1, high, sortingProps);
            
            return i + 1;
        }
    
        async function doQuickSort(arr, low, high){
            if (low < high) {
                const pivot = await partition(arr, low, high);
                await doQuickSort(arr, low, pivot - 1); 
                await doQuickSort(arr, pivot + 1, high); 
            }
        }

        await doQuickSort(valueArray, 0, valueArray.length - 1);
    }

    async function heapSort(sortingProps) {
        const { valueArray } = sortingProps;
    
        async function doHeapSort(arr) {
            const n = arr.length;
    
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
                await heapify(arr, n, i);
    
            for (let i = n - 1; i > 0; i--) {
                if(stopOnGoingSort) return;
                await swapLogic(0, i, sortingProps);
                await heapify(arr, i, 0);
            }
        }
    
        async function heapify(arr, n, i) {

            if(stopOnGoingSort) return;
            let largest = i;
            const l = 2 * i + 1, r = 2 * i + 2;

            if (l < n && await compare(largest, l, sortingProps)) largest = l;
    
            if(stopOnGoingSort) return;
            if (r < n && await compare(largest, r, sortingProps)) largest = r;
    
            if(stopOnGoingSort) return;
            if (largest != i) {
                await swapLogic(i, largest, sortingProps);
                await heapify(arr, n, largest);
            }
        }

        await doHeapSort(valueArray);
    }

    // Think and add a way to manipulate at the time of sorting
    async function mergeSort(sortingProps){

        const { valueArray } = sortingProps;

        async function merge(arr, l, m, r){
            if(stopOnGoingSort) return;
            const n1 = m - l + 1,
                n2 = r - m;
        
            const L = arr.slice(l, l + n1), R = arr.slice(m+1, m+1 + n2);
        
            let i = 0, j = 0, k = l;

            while (i < n1 && j < n2){

                const bool = await compare(i, j, sortingProps, L, R, l, m + 1)

                await bool
                    ? setHeightDirectly(k++, L[i++], sortingProps)
                    : setHeightDirectly(k++, R[j++], sortingProps);
            }
            
            while (i < n1) await setHeightDirectly(k++, L[i++], sortingProps);
            while (j < n2) await setHeightDirectly(k++, R[j++], sortingProps);
        }
        
        async function doMergeSort(arr, l, r){
            if(stopOnGoingSort) return;
            if (l < r) {
                const m = l + parseInt( (r-l) / 2 );
        
                await doMergeSort(arr, l, m);
                await doMergeSort(arr, m + 1, r);

                await merge(arr, l, m, r);
            }
        }
        
        await doMergeSort(valueArray, 0, valueArray.length - 1);
    }

    // Think and add a way to manipulate at the time of sorting
    async function radixSort(sortingProps) {

        const { valueArray } = sortingProps;

        async function countSort(arr, exp) {
    
            let n = valueArray.length,
                result = new Array(n),
                count = new Array(10).fill(0);
        
            arr.forEach(val => count[ Math.floor(val / exp) % 10 ]++);
        
            for (let i = 1; i < 10; i++)
                count[i] += count[i - 1];
            
            for (let i = n - 1; i >= 0; i--) {
                if(stopOnGoingSort) return;
                const idx = Math.floor(arr[i] / exp) % 10;

                await setHeightDirectly(-- count[ idx ], arr[i], sortingProps, result);

                // result[ -- count[ idx ] ] = arr[i];
            }

            // for(const [ idx, val ] of Object.entries(result) )
                // await setHeightDirectly(idx, val, sortingProps);
            
            result.forEach((val, idx) => arr[idx] = val);
        }

            
        for (let exp = 1, m = Math.max(...valueArray); Math.floor(m / exp) > 0; exp *= 10){
            if(stopOnGoingSort) return;
            await countSort(valueArray, exp);
        }
    }
    
  async function wrapper(sortingCallback, sortingProps, sortingAlgoName) {
    console.log(`Starting of ${sortingAlgoName}`);
    isAnySortOngoing = true;
    stopOnGoingSort = false;

    await sortingCallback(sortingProps);

    isAnySortOngoing = false;
    stopOnGoingSort = false;

    console.log(`End of ${sortingAlgoName}`);

    const copyOfSortOnQueue = sortOnQueue;
    sortOnQueue = () => {};
    copyOfSortOnQueue();
  }

  return {
    bubbleSort: (...args) => wrapper(bubbleSort, ...args),
    selectionSort: (...args) => wrapper(selectionSort, ...args),
    quickSort: (...args) => wrapper(quickSort, ...args),
    heapSort: (...args) => wrapper(heapSort, ...args),

    mergeSort: (...args) => wrapper(mergeSort, ...args),
    radixSort: (...args) => wrapper(radixSort, ...args),
  };
})();

/************************************************************ Driver code ***********************************************************************/

// Html elements
const container = document.getElementById('bar-container'),
    buttonList = document.getElementById('sorting-button-list'),
    resetArray = document.getElementById('reset-array'),
    speedSlider = document.getElementById('speed-slider'),
    itemCountSlider = document.getElementById('item-count-slider');

// Global variables for maintaining states
let arraySizeMultiplier = window.screen.width < 600 ? 2 : 5,
    range, proportion, sortingDetails = {};

let isAnySortOngoing = false, stopOnGoingSort = false, sortOnQueue = () => {};

/* Creating list items with text + event ->
    <li onclick='() => quickSort(sortingDetails)'>'Quick sort'</li>
    ...
*/
for(const fn of Object.values(SortingAlgos)){

    // Button text from function name :: mergeSort -> Merge sort
    const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1),
        text = capitalize( fn.name.split('Sort')[0] ) + ' sort';

    const li = document.createElement('li');
    li.textContent = text;
    li.addEventListener('click', () => {
        if (isAnySortOngoing) {
            stopOnGoingSort = true;
            sortOnQueue = () => fn(sortingDetails, text);
        } else {
            fn(sortingDetails, text);
        }
    });

    buttonList.append(li);
}

// Initial setting
ArraySortingUtils.alterRange(itemCountSlider.value);
ArraySortingUtils.alterSpeed(speedSlider.value);


// Adding events for buttons & sliders
resetArray.addEventListener('click', () => {
    stopOnGoingSort = true;
    sortOnQueue = () => {};
    ArraySortingUtils.createNewGraph();
});

itemCountSlider.addEventListener('change', ({target}) => {
    stopOnGoingSort = true;
    sortOnQueue = () => {};
    ArraySortingUtils.alterRange(target.value);
});
speedSlider.addEventListener('change', ({target}) => ArraySortingUtils.alterSpeed(target.value) );


// For UI Testing
// SortingAlgos.bubbleSort(sortingDetails);