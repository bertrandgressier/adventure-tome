/**
 * Stats - Value Object
 * Représente les statistiques d'un personnage avec validation
 */

export interface StatsData {
  dexterite: number;
  constitution?: number;
  reputation?: number;
  chance: number;
  chanceInitiale: number;
  pointsDeVieMax: number;
  pointsDeVieActuels: number;
  experience?: number;
  etat?: string;
  statut?: string;
}

export class Stats {
  constructor(
    public readonly dexterite: number,
    public readonly constitution: number | null,
    public readonly reputation: number | null,
    public readonly chance: number,
    public readonly chanceInitiale: number,
    public readonly maxHealth: number,
    public readonly currentHealth: number,
    public readonly experience: number | null,
    public readonly etat: string | null,
    public readonly statut: string | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.dexterite < 1) {
      throw new Error('La dextérité doit être supérieure ou égale à 1');
    }
    if (this.constitution !== null && this.constitution < 0) {
      throw new Error('La constitution doit être supérieure ou égale à 0');
    }
    if (this.reputation !== null && (this.reputation < -5 || this.reputation > 5)) {
      throw new Error('La réputation doit être comprise entre -5 et 5');
    }
    if (this.chance < 0) {
      throw new Error('La chance doit être supérieure ou égale à 0');
    }
    if (this.chanceInitiale < 0) {
      throw new Error('La chance initiale doit être supérieure ou égale à 0');
    }
    if (this.maxHealth < 1) {
      throw new Error('Les points de vie maximum doivent être supérieurs ou égaux à 1');
    }
    if (this.currentHealth < 0) {
      throw new Error('Les points de vie actuels doivent être supérieurs ou égaux à 0');
    }
    if (this.currentHealth > this.maxHealth) {
      throw new Error('Les points de vie actuels ne peuvent pas dépasser le maximum');
    }
    if (this.experience !== null && this.experience < 0) {
      throw new Error('L\'expérience doit être supérieure ou égale à 0');
    }
  }

  /**
   * Crée une nouvelle instance avec les stats mises à jour
   * Pattern immutable - ne modifie jamais l'instance actuelle
   */
  update(newStats: Partial<StatsData>): Stats {
    const newMaxHealth = newStats.pointsDeVieMax ?? this.maxHealth;
    let newCurrentHealth = newStats.pointsDeVieActuels;

    if (newCurrentHealth === undefined) {
      newCurrentHealth = this.currentHealth;
    }

    if (newCurrentHealth > newMaxHealth) {
      newCurrentHealth = newMaxHealth;
    }

    return new Stats(
      newStats.dexterite ?? this.dexterite,
      newStats.constitution !== undefined ? (newStats.constitution ?? null) : this.constitution,
      newStats.reputation !== undefined ? (newStats.reputation ?? null) : this.reputation,
      newStats.chance ?? this.chance,
      newStats.chanceInitiale ?? this.chanceInitiale,
      newMaxHealth,
      newCurrentHealth,
      newStats.experience !== undefined ? (newStats.experience ?? null) : this.experience,
      newStats.etat !== undefined ? (newStats.etat || null) : this.etat,
      newStats.statut !== undefined ? (newStats.statut || null) : this.statut
    );
  }

  /**
   * Réduit la chance de 1 (après un test de chance)
   */
  decreaseChance(): Stats {
    return new Stats(
      this.dexterite,
      this.constitution,
      this.reputation,
      Math.max(0, this.chance - 1),
      this.chanceInitiale,
      this.maxHealth,
      this.currentHealth,
      this.experience,
      this.etat,
      this.statut
    );
  }

  /**
   * Applique des dégâts aux points de vie
   */
  takeDamage(damage: number): Stats {
    if (damage < 0) {
      throw new Error('Les dégâts ne peuvent pas être négatifs');
    }

    return new Stats(
      this.dexterite,
      this.constitution,
      this.reputation,
      this.chance,
      this.chanceInitiale,
      this.maxHealth,
      Math.max(0, this.currentHealth - damage),
      this.experience,
      this.etat,
      this.statut
    );
  }

  /**
   * Soigne le personnage
   */
  heal(amount: number): Stats {
    if (amount < 0) {
      throw new Error('La quantité de soin ne peut pas être négative');
    }

    return new Stats(
      this.dexterite,
      this.constitution,
      this.reputation,
      this.chance,
      this.chanceInitiale,
      this.maxHealth,
      Math.min(this.maxHealth, this.currentHealth + amount),
      this.experience,
      this.etat,
      this.statut
    );
  }

  /**
   * Vérifie si le personnage est mort
   */
  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  /**
   * Vérifie si le personnage a peu de vie (25% ou moins)
   */
  isCriticalHealth(): boolean {
    return this.currentHealth > 0 && this.currentHealth <= this.maxHealth / 4;
  }

  /**
   * Convertit en format de données pour la persistance
   */
  toData(): StatsData {
    return {
      dexterite: this.dexterite,
      constitution: this.constitution ?? undefined,
      reputation: this.reputation !== null ? this.reputation : undefined,
      chance: this.chance,
      chanceInitiale: this.chanceInitiale,
      pointsDeVieMax: this.maxHealth,
      pointsDeVieActuels: this.currentHealth,
      experience: this.experience ?? undefined,
      etat: typeof this.etat === 'string' ? this.etat : undefined,
      statut: typeof this.statut === 'string' ? this.statut : undefined,
    };
  }

  /**
   * Crée une instance depuis des données
   */
  static fromData(data: StatsData): Stats {
    return new Stats(
      data.dexterite,
      data.constitution ?? null,
      data.reputation ?? null,
      data.chance,
      data.chanceInitiale,
      data.pointsDeVieMax,
      data.pointsDeVieActuels,
      data.experience ?? null,
      typeof data.etat === 'string' ? data.etat : null,
      typeof data.statut === 'string' ? data.statut : null
    );
  }
}
