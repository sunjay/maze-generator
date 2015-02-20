"""
Human Maze Solving AI

This AI models a human going through a maze. The human has no other information
other than that there is an exit somewhere. The human must track their way
through the maze, remember where they have been and then move through each path
to reason through where the exit is.
"""
import random

from collections import deque

# The location of an opening on a tile
# Each tile can have 0 to 4 openings
TOP = "T"
BOTTOM = "B"
LEFT = "L"
RIGHT = "R"

SIDES = (TOP, BOTTOM, LEFT, RIGHT)

# For two tiles to be connected, the appropriate sides must be connected
# as defined in this dictionary
CONNECTABLE_SIDES = {
    TOP: BOTTOM,
    BOTTOM: TOP,
    LEFT: RIGHT,
    RIGHT: LEFT
}


class Tile(object):
    
    def __init__(self, **kwargs):
        self.top_wall = kwargs.get("top_wall", True)
        self.bottom_wall = kwargs.get("bottom_wall", True)
        self.left_wall = kwargs.get("left_wall", True)
        self.right_wall = kwargs.get("right_wall", True)
        
        self.is_start = kwargs.get("is_start", False)
        self.is_end = kwargs.get("is_end", False)


class Maze(object):
    
    def __init__(self, maze_data=None):
        if maze_data is None:
            maze_data = Maze._blank_grid()
        self.grid = maze_data
        
    @property
    def cols(self):
        if not self.grid:
            return 0
        return len(self.grid[0])
    
    @property
    def rows(self):
        return len(self.grid)
    
    @staticmethod
    def _blank_grid(cols=40, rows=40):
        return [[Tile() for j in xrange(cols)] for i in xrange(rows)]
    
    def _get_adjacent_tiles(self, row, col, tile):
        """
        Creates a generator that represents all adjacent tiles
        """
        if (row - 1) > 0:
            yield (row - 1, col, self.grid[row - 1][col])
        
        if (row + 1) < self.rows:
            yield (row + 1, col, self.grid[row + 1][col])
        
        if (col - 1) > 0:
            yield (row, col - 1, self.grid[row][col - 1])
        
        if (col + 1) < self.cols:
            yield (row, col + 1, self.grid[row][col + 1])
    
    def _is_edge(self, row, col):
        horizontal_edge = (row == 0) or (row == (self.rows - 1))
        vertical_edge = (col == 0) or (col == (self.cols - 1))
        return horizontal_edge or vertical_edge
    
    def _hide_edge_wall(self, row, col, tile):
        """
        Hides the wall at the edge of the board if any
        
        Hides up to one wall
        """
        if col == 0:
            tile.left_wall = False
        elif col == (self.cols - 1):
            tile.right_wall = False
        elif row == 0:
            tile.top_wall = False
        elif row == (self.rows - 1):
            tile.bottom_wall = False
    
    def randomize(self, min_path_length=20):
        """
        Generates a random grid on this maze
        """
        # Start on the edge
        start_col = random.randint(0, 1) * (self.cols - 1)
        start_row = random.randint(0, self.cols - 1)
        
        start_tile = self.grid[start_row][start_col]
        start_tile.is_start = True
        self._hide_edge_wall(start_row, start_col, start_tile)
        
        reached_end = False
        
        open_nodes = deque([(start_row, start_col, start_tile)])
        closed_nodes = set()
        
        path_length = 1
        while open_nodes:
            row, col, tile = open_nodes.popleft()
            closed_nodes.add(tile)
            
            # If this is an edge then we've reached the end
            if (not reached_end and tile is not start_tile and self._is_edge(row, col)
                    # If the path is long enough
                    and path_length >= min_path_length):
                tile.is_end = True
                self._hide_edge_wall(row, col, tile)
                
                reached_end = True
                continue
            
            all_adjacents = list(self._get_adjacent_tiles(row, col, tile))
            adjacents = list((r, c, t) for r, c, t in all_adjacents if t not in closed_nodes)
            
            # all_adjacents is used in the case where no unclosed adjacents are
            # available, but we still want to allow the path to continue to
            # one node that has already been visited
            if not adjacents:
                if not reached_end:
                    # the adjacents to choose from
                    chosen_adjacents = all_adjacents
                
                else:
                    continue
            else:
                chosen_adjacents = adjacents
            
            adj_row, adj_col, adjacent_node = random.choice(chosen_adjacents)
            if adj_row == row - 1:
                tile.top_wall = False
                adjacent_node.bottom_wall = False
            
            elif adj_row == row + 1:
                tile.bottom_wall = False
                adjacent_node.top_wall = False
            
            elif adj_col == col - 1:
                tile.left_wall = False
                adjacent_node.right_wall = False
            
            elif adj_col == col + 1:
                tile.right_wall = False
                adjacent_node.left_wall = False
            
            else:
                raise ValueError("Something went horribly wrong")
            
            open_nodes.appendleft((adj_row, adj_col, adjacent_node))
            open_nodes.extend((r, c, t) for r, c, t in adjacents if t is not adjacent_node)
            
            if not reached_end:
                path_length += 1
            
            yield
        

def wait_for_space(pygame):
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            pressed = pygame.key.get_pressed()
            if pressed[pygame.K_SPACE]:
                return True


def main():
    import pygame
    pygame.init()
    
    width, height = 600, 600
    screen = pygame.display.set_mode((width, height))
    
    maze = Maze()
    maze_gen = maze.randomize()
    
    tile_width = width / maze.cols
    tile_height = height / maze.rows
    
    path_width = int(tile_width*0.5)
    path_height = int(tile_height*0.5)
    
    clock = pygame.time.Clock()

    print "Press space to start"
    running = wait_for_space(pygame)
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        screen.fill((120, 120, 120))
        
        tile_surface = pygame.Surface((tile_width, tile_height))
        for i, row in enumerate(maze.grid):
            for j, tile in enumerate(row):
                if tile.is_start:
                    tile_surface.fill((100, 200, 100))
                elif tile.is_end:
                    tile_surface.fill((200, 100, 100))
                else:
                    tile_surface.fill((255, 255, 255))
                
                if tile.top_wall:
                    pygame.draw.line(tile_surface, (0, 0, 0),
                        (0, 0), (tile_width, 0), 6)
                
                if tile.bottom_wall:
                    pygame.draw.line(tile_surface, (0, 0, 0),
                        (0, tile_height), (tile_width, tile_height), 6)
                
                if tile.left_wall:
                    pygame.draw.line(tile_surface, (0, 0, 0),
                        (0, 0), (0, tile_height), 6)
                
                if tile.right_wall:
                    pygame.draw.line(tile_surface, (0, 0, 0),
                        (tile_width, 0), (tile_width, tile_height), 6)
                
                screen.blit(tile_surface, (j * tile_width, i * tile_height))
        
        pygame.display.flip()
        
        try:
            maze_gen.next()
        except StopIteration:
            pass
        clock.tick(60)
    
    pygame.quit()

if __name__ == "__main__":
    main()
