import random
n = random.randint(0,99)
while n:
  i = int(input("Enter an number: "))
  if i < n:
    print("Higher.")
  elif i > n:
    print("Lower.")
  else:
    print("Congratulations.")
    break
