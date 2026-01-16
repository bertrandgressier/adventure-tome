import type { CombatRound, Enemy } from '@/src/domain/types/combat';
import { Attacker } from '@/src/domain/types/Attacker';

/**
 * CombatService - Domain Service
 * 
 * Service de domaine pour la gestion des combats.
 * Contient toute la logique métier des règles de combat du livre.
 */
export class CombatService {
  /**
   * Lance 2 dés à 6 faces et retourne le total
   */
  static rollTwoDice(): number {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    return die1 + die2;
  }

  /**
   * Lance 1 dé à 6 faces
   */
  static rollOneDie(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  /**
   * Vérifie si l'attaque touche
   * Règle : 2d6 <= DEXTÉRITÉ = touché
   */
  static checkHit(dexterite: number, diceRoll?: number): { hit: boolean; roll: number } {
    const roll = diceRoll ?? this.rollTwoDice();
    return {
      hit: roll <= dexterite,
      roll
    };
  }

  /**
   * Calcule les dégâts infligés
   * Règle : 1 (base) + 1d6 + Points de dommage de l'arme
   */
  static calculateDamage(weaponDamage: number, damageDiceRoll?: number): { damage: number; diceRoll: number } {
    const diceRoll = damageDiceRoll ?? this.rollOneDie();
    const damage = 1 + diceRoll + weaponDamage;
    return {
      damage,
      diceRoll
    };
  }

  /**
   * Résout un round de combat (une attaque)
   */
  static resolveCombatRound(
    roundNumber: number,
    attacker: Attacker,
    playerDexterite: number,
    playerEndurance: number,
    playerWeaponDamage: number,
    enemy: Enemy,
    enemyEndurance: number,
    hitDiceRoll?: number,
    damageDiceRoll?: number
  ): CombatRound {
    const isPlayerAttacking = attacker === Attacker.PLAYER;
    const attackerDex = isPlayerAttacking ? playerDexterite : enemy.dexterite;
    const attackerWeapon = isPlayerAttacking ? playerWeaponDamage : enemy.attackPoints;
    
    // 1. Test pour toucher
    const hitCheck = this.checkHit(attackerDex, hitDiceRoll);
    
    let playerEnduranceAfter = playerEndurance;
    let enemyEnduranceAfter = enemyEndurance;
    let totalDamage: number | undefined;
    let dmgDiceRoll: number | undefined;
    
    // 2. Si touché, calculer les dégâts
    if (hitCheck.hit) {
      const damageCalc = this.calculateDamage(attackerWeapon, damageDiceRoll);
      totalDamage = damageCalc.damage;
      dmgDiceRoll = damageCalc.diceRoll;
      
      // Appliquer les dégâts
      if (isPlayerAttacking) {
        enemyEnduranceAfter = Math.max(0, enemyEndurance - totalDamage);
      } else {
        playerEnduranceAfter = Math.max(0, playerEndurance - totalDamage);
      }
    }
    
    return {
      roundNumber,
      attacker,
      hitDiceRoll: hitCheck.roll,
      hitSuccess: hitCheck.hit,
      damageDiceRoll: dmgDiceRoll,
      weaponDamage: hitCheck.hit ? attackerWeapon : undefined,
      totalDamage,
      playerEnduranceAfter,
      enemyEnduranceAfter
    };
  }
}
