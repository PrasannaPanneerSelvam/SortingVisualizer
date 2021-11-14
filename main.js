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



const swapLogic = async function(idx1, idx2, {valueArray, divArray, delayTiming}){

    const sleepFn = () => new Promise(_ => setTimeout(_, delayTiming));

    await sleepFn();

    const value1 = valueArray[idx1],
        value2 = valueArray[idx2];

    // Swapping original values
    valueArray[idx1] = value2;
    valueArray[idx2] = value1;

    // Altering respective bar heights
    divArray[idx1].style.height = `${value2 * proportion}%`;
    divArray[idx2].style.height = `${value1 * proportion}%`;
}

const printAsPerCurrent = async function({valueArray, divArray, delayTiming}){

    const sleepFn = () => new Promise(_ => setTimeout(_, delayTiming));

    await sleepFn();

    // Altering respective bar heights
    valueArray.forEach( (itemVal, idx) => divArray[idx].style.height = `${ itemVal * proportion}%` );

}

// Impure function
function createNewGraph(){
    const { valueArray, divArray } = createBarsArray(range);
    divArray.forEach(child => container.append(child) );
    sortingDetails = { ...sortingDetails, valueArray, divArray };
}

// Impure function
function alterRange(inp){

    // Resetting children
    container.innerHTML = '';

    range = inp;
    proportion = 100 / range;
    createNewGraph();
}

// Impure function
function alterSpeed(speed){
    delayTiming = speed;
    sortingDetails.delayTiming = delayTiming;
}



const SortingAlgos = (function (){

    async function bubbleSort(sortingProps){

        const { valueArray } = sortingProps;
     
        for(let i = 0; i < valueArray.length; i++)
          for(let j = 0; j < ( valueArray.length - i - 1 ); j++)
            if(valueArray[j] > valueArray[j+1])
                await swapLogic(j, j+1, sortingProps);
    }

    async function selectionSort(sortingProps){

        const { valueArray } = sortingProps;

        var i, j, min_idx, n = valueArray.length;
    
        for (i = 0; i < n-1; i++) {
            min_idx = i;
            for (j = i + 1; j < n; j++)
                if (valueArray[j] < valueArray[min_idx])
                    min_idx = j;
    
            await swapLogic(min_idx, i, sortingProps);
        }
    }

    async function quickSort(sortingProps){

        const { valueArray } = sortingProps;

        async function partition (arr, low, high){ 
            var pivot = arr[high], i = low - 1;
        
            for (var j = low; j <= high - 1; j++)
                if (arr[j] < pivot)
                    await swapLogic(++i, j, sortingProps);

            await swapLogic(i+1, high, sortingProps);
            
            return i + 1;
        }
    
        async function doQuickSort(arr, low, high){
            if (low < high) {
                var pivot = await partition(arr, low, high);
                await doQuickSort(arr, low, pivot - 1); 
                await doQuickSort(arr, pivot + 1, high); 
            }
        }

        await doQuickSort(valueArray, 0, valueArray.length - 1);
    }

    async function heapSort(sortingProps) {
        const { valueArray } = sortingProps;
    
        async function doHeapSort(arr) {
            var n = arr.length;
    
            for (var i = Math.floor(n / 2) - 1; i >= 0; i--)
                await heapify(arr, n, i);
    
            for (var i = n - 1; i > 0; i--) {
                await swapLogic(0, i, sortingProps);
                await heapify(arr, i, 0);
            }
        }
    
        async function heapify(arr, n, i) {

            var largest = i, l = 2 * i + 1, r = 2 * i + 2;
    
            if (l < n && arr[l] > arr[largest]) largest = l;
    
            if (r < n && arr[r] > arr[largest]) largest = r;
    
            if (largest != i) {
                await swapLogic(i, largest, sortingProps);
                await heapify(arr, n, largest);
            }
        }

        await doHeapSort(valueArray);
    }


    // Think and add a way to manipulate at the time of sorting
    async function insertionSort(sortingProps) { 
        
        const { valueArray } = sortingProps;

        let i, key, j, n = valueArray.length;

        for (i = 1; i < n; i++) { 
            key = valueArray[i]; 
            j = i - 1; 
    
            while (j >= 0 && valueArray[j] > key){ 
                valueArray[j + 1] = valueArray[j]; 
                j = j - 1; 
            }

            valueArray[j + 1] = key;
            await printAsPerCurrent(sortingProps);
        }
    }

    // Think and add a way to manipulate at the time of sorting
    async function mergeSort(sortingProps){

        const { valueArray } = sortingProps;

        async function merge(arr, l, m, r){
            var i, j, k,
                n1 = m - l + 1,
                n2 = r - m;
        
            var L = new Array(n1), R = new Array(n2);
        
            for (i = 0; i < n1; i++) L[i] = arr[l + i];
        
            for (j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
        
            i = 0, j = 0, k = l;
        
            while (i < n1 && j < n2)
                if (L[i] <= R[j]) arr[k++] = L[i++];
                else arr[k++] = R[j++];
        
            while (i < n1) arr[k++] = L[i++];
        
            while (j < n2) arr[k++] = R[j++];
        }
        
        async function doMergeSort(arr, l, r){
            if (l < r) {
                var m =l+ parseInt((r-l)/2);

                console.log(l, m, r);
        
                await doMergeSort(arr, l, m);
                await doMergeSort(arr, m + 1, r);
        
                merge(arr, l, m, r);
                await printAsPerCurrent(sortingProps);
            }
        }
        
        await doMergeSort(valueArray, 0, valueArray.length - 1);

    }

    return {
        bubbleSort,
        selectionSort,
        quickSort,
        heapSort,

        insertionSort,
        mergeSort,
    };
}());


// Html elements
const container = document.getElementById('bar-container'),
    buttonList = document.getElementById('button-list-list'),
    resetArray = document.getElementById('reset-array'),
    speedSlider = document.getElementById('speed-slider'),
    itemCountSlider = document.getElementById('item-count-slider');

let range, proportion, delayTiming, sortingDetails;


// Initial setting
alterRange(itemCountSlider.value * 5);
alterSpeed(speedSlider.value);


for(const fn of Object.values(SortingAlgos)){

    // Button text from function name :: mergeSort -> Merge sort
    const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1),
        text = capitalize( fn.name.split('Sort')[0] ) + ' sort';

    const li = document.createElement('li');
    li.innerText = text;

    li.addEventListener('click', () => fn(sortingDetails));

    buttonList.append(li);
}

resetArray.addEventListener('click', () => alterRange(range));

itemCountSlider.addEventListener('change', ({target}) => alterRange(target.value * 5) );

speedSlider.addEventListener('change', ({target}) => alterSpeed(target.value) );

// SortingAlgos.bubbleSort(sortingDetails);
