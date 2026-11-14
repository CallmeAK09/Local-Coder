import inspect


arr = [12, 78, 3, 1, 14, 5]
#------------------------------------
def linear_search(arr, target):
        for i in range(len(arr)):
                if arr[i] == target:
                        return f"Target {target} fount at index {i}"
        return f"Target {target} not found!"

def binary_search(arr, target):
        low = 0
        high = len(arr) - 1
        arr = quick_sort(arr)

        while low <= high:
                mid = (low + high) // 2
                if arr[mid] == target:
                        return f"Target {target} found at index {mid}"
                elif target < arr[mid]:
                        high = mid - 1
                else:
                        low = mid + 1
        return f"Target {target} not found!"
#----------------------------------------
def bubble_sort(arr):
	for i in range(n:=len(arr)):
		for j in range(n - i - 1):
			if arr[j] > arr[j+1]:
				arr[j], arr[j+1] = arr[j+1], arr[j]
	return arr

def selection_sort(arr):
	for i in range(n:=len(arr)):
		min_index = i
		for j in range(i, n):
			if arr[j] > arr[min_index]:
				min_index = j
		arr[i], arr[min_index] = arr[min_index], arr[i]
	return arr

def insertion_sort(arr):
	for i in range(1, n:=len(arr)):
		key = arr[i]
		j = i - 1

		while j >= 0 and arr[j] > key:
			arr[j+1] = arr[j]
			j -= 1
		arr[j+1] = key
	return arr

def quick_sort(arr):
	if len(arr) <= 1:
		return arr

	piv = arr[0]
	left = []
	right = []
	for i in range(1, len(arr)):
		if arr[i] < piv:
			left.append(arr[i])
		else:
			right.append(arr[i])

	return quick_sort(left) + [piv] + quick_sort(right)

def merge_sort(arr):
	if len(arr) <= 1:
		return arr
	mid = len(arr) // 2
	left = merge_sort(arr[mid:])
	right = merge_sort(arr[:mid])
	res = []

	while left and right:
		if left[0] < right[0]:
			res.append(left[0])
			left.pop(0)
		else:
			res.append(right[0])
			right.pop(0)

	return res + left + right

#----------------------------------------
print(f"""The array is arr = {arr} \n
please select the options : """)

search = None
sort = None
option = None

while True:
	try:
		option = input("""1 - Search
2 - Sort \n""")
		option = int(option)
	except ValueError:
		print("Enter numbers only!")

	if option == 1:
		try:
			search = int(input("""1 - Linear Search
2 - Binary Search \n"""))
			break
		except ValueError:
                        print("Enter numbers only!")
	elif option == 2:
		try:
			sort = int(input("""1 - Bubble Sort
2 - Selection Sort
3 - Insertion Sort
4 - Quick Sort
5 - Merge Sort\n"""))
			break
		except ValueError:
                        print("Enter numbers only!")

	else:
		print(f"{option} is an invalid option! Try again!")

while search:
    try:
        target = int(input("Enter a target element: "))
    except ValueError:
        print("Enter numbers only! Try again!")
        continue

    if search == 1:
        code = inspect.getsource(linear_search)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{linear_search(arr, target)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break
    elif search == 2:
        code = inspect.getsource(binary_search)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{binary_search(arr, target)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break
    else:
        print("Invalid option! Try again!")
#-----------------------------------------------
while sort:
    if sort == 1:
        code = inspect.getsource(bubble_sort)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{bubble_sort(arr)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break

    elif sort == 2:
        code = inspect.getsource(selection_sort)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{selection_sort(arr)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break

    elif sort == 3:
        code = inspect.getsource(insertion_sort)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{insertion_sort(arr)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break

    elif sort == 4:
        code = inspect.getsource(quick_sort)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{quick_sort(arr)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break

    elif sort == 5:
        code = inspect.getsource(merge_sort)
        print(f"""{'-' * 10}
Response :
{'-' * 10}
{merge_sort(arr)}
{'-' * 12}
Source code :
{'-' * 12}
{code}""")
        break

    else:
        print(f"{option} is an invalid option! Try again!")
