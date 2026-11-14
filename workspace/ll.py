# Linked list

class SinglyNode:
    def __init__(self, data):
        self.data = data
        self.next = None
    
class SinglyLL:
    def __init__(self):
        self.head = None
        
    def display(self):
        curr = self.head
        while curr:
            print(curr.data, end='->')
            curr = curr.next
        print(None)
        
    def insert(self, val):
        new_node = SinglyNode(val)
        
        if not self.head:
            self.head = new_node
            return
        
        curr = self.head
        while curr.next:
            curr = curr.next
            
        curr.next = new_node
        return
    
    def reverse(self):
        prev = None
        curr = self.head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
            
        self.head = prev
    
    def length(self):
        count = 0
        curr = self.head
        while curr:
            count += 1
            curr = curr.next
        
        return count
    
    def is_circular(self):
        slow = self.head
        fast = self.head
        
        while fast and fast.next: 
            slow = slow.next
            fast = fast.next.next
            print(fast.data, slow.data)
            if fast == slow:
                break
        
        return fast == slow
        
    def circular(self, pos):
        length = self.length()
        if pos < 0 or pos > length:
            return f"Invalid position.Length is {length}."
            
        count = 0
        curr = self.head
        cir = None
        
        while curr:
            if count == pos:
                cir = curr
                break
            count += 1
            curr = curr.next
        
        curr.next = cir
    
    def middle(self):
        slow = self.head
        fast = self.head
        while fast:
            if not fast.next:
                return slow.data
            elif not fast.next.next:
                return slow.next.data
                
            slow = slow.next
            fast = fast.next.next
    
    def remove_nth(self, n):
        count = 0
        curr = self.head
        if n == 0:
            self.head = self.head.next
            return
        prev = None
        while curr:
            if count == n:
                prev.next = curr.next
                return "Success"
            
            count += 1
            prev = curr
            curr = curr.next
        return "Invalid Position"
    
    def remove_dup(self):
        seen = set()
        curr = self.head
        
        prev = None
        while curr:
            if curr.data not in seen:
                seen.add(curr.data)
                prev = curr
                curr = curr.next
            else:
                prev.next = curr.next
                curr = curr.next
        return self.display()
    def sort_ll(self):
        self.head = merge_sort(self.head)
        
def merge_sort(node):
    if not node or not node.next:
        return node
        
    slow = node
    fast = node.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    right_ll = slow.next
    slow.next = None
    left_ll = node
    
    left = merge_sort(left_ll)
    right = merge_sort(right_ll)
    
    res = SinglyNode(None)
    dummy = res
    
    while left and right:
        if left.data > right.data:
            dummy.next = left
            left = left.next
            dummy = dummy.next
        else:
            dummy.next = right
            right = right.next
            dummy = dummy.next
    if left:
        dummy.next = left
    if right:
        dummy.next = right
        
    return res.next
    
    
arr = [1, 2, 3, 4, 4, 2, 7, 1, 1, 5, 6]

sl = SinglyLL()

for v in arr:
    sl.insert(v)
    
sl.display()
sl.display()
print(sl.length())
print(sl.middle())
print(sl.remove_nth(9))
sl.display()
sl.sort_ll()
sl.display()
