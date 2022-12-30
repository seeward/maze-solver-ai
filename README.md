### simple neural network to solve a 10 x 10 maze

#### Why use a NN?
The problem of solving a maze (or playing most games) can be reduced to a function whose inputs (the game state) produce one of 2 outcomes - win or lose (some cases a third option: tie)

value = f(board) - what is f() ?
BQF - Best Quality Function 
Q ( s, a) 
Q = max reward for taking a specific (a) Action in a specific (s) state

build a Neural Network (N) with inputs -  (s) State and (a) Action and output a q value vector

We will deploy 10 agents at a time and select the best Q score to 
use as seed for the next generated agents

train the NN on the saved history episodes of the winning agent

simple option
```

// a 2D array - 100 units
// 1 = agent 0 = empty 2 = wall

   xs = [
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   ]


// [up,down.left.right]
   ys = [
      [0,10,0,10], // reward is to the right
      [0,10,0,5], // reward is between down > right
      [0,7,0,10] // reward is between down < right 
   ]




```

complex option

```

episode = [envstate, action, reward, envstate_next, game_over]

```



Win State = 1
Lose State = 0
// Q score is the output of a function that takes tile and target ids
Q score = f(C, Tc) 

drawSolutionPath
 Path (P) is an array of Cell Ids (cId)
 Start Cell (Sc) is the first element - any cell from col 1
 Forward Stride (Fs) is a random number between 0/9
 Vertical Stride (Vs) is a random number between 0/9
    if Sc row is > 5  then Vs = (Vs * -1) * gridSize
    if Sc row is < 5 then Vs = Vs
 for c in Fs:
    change cell to status = path
    change cell color = path color
 for c in Vs:
    change cell to status = path
    change cell color = path color
 for c in f(remainingCellsToEndCol):
    change cell to status = path
    change cell color = path color
 
calculateQScore for each cell in status path
 Define a Target Cell (Tc) and get (x,y) - any cell from col 10
 Iterate over each cell (c) and use cx,cy to calculate how far it is from Target Cell Tcx,Tcy
 Record Q value to q property on cell




 